<?php
/**
 * Portfolio admin API.
 *
 * Security model
 * - The admin password is set ONCE (first "setup" call). The hash file is created with an
 *   exclusive lock + O_EXCL semantics, so a second setup is impossible; afterwards the password
 *   can only be changed by proving the current one.
 * - Only a hash is stored: Argon2id when PHP supports it, bcrypt (cost 12) otherwise
 *   (password_hash / password_verify, salted, constant-time verification).
 * - Private data lives in api/private/*.php files that `return` an array: even if the
 *   .htaccess protection were ignored, requesting them over HTTP prints nothing.
 * - Sessions: HttpOnly, SameSite=Strict, Secure on HTTPS, id regenerated on login,
 *   idle (30 min) and absolute (8 h) timeouts.
 * - CSRF: every POST must carry the per-session X-CSRF-Token header.
 * - Brute force: 5 wrong passwords per IP => 15 minute lockout.
 */

declare(strict_types=1);

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 256;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_SECONDS = 900;
const SESSION_IDLE_SECONDS = 1800;
const SESSION_MAX_SECONDS = 28800;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_SIDE = 6000;
const MAX_TEXT_LENGTH = 20000;
const MAX_LIST_ITEMS = 100;
const MAX_LANGUAGES = 30;
const MAX_TRANSLATION_STRINGS = 1000;
const MAX_TRANSLATION_LENGTH = 2000;
const MAX_TRANSLATION_DEPTH = 4;
// English is the main language: its content is in files/*.json, other languages in files/i18n/<code>/.
const DEFAULT_LANGUAGE = 'en';
// Documents with a version per language (keep in sync with LOCALIZABLE in src/shared/content.ts).
const LOCALIZABLE = ['profile.json', 'aboutMe.json', 'educationContent.json', 'experienceContent.json',
    'expertise.json', 'contacts.json'];

$PRIVATE_DIR = rtrim(getenv('PORTFOLIO_PRIVATE_DIR') ?: __DIR__ . '/private', '/\\');
$FILES_DIR = rtrim(getenv('PORTFOLIO_FILES_DIR') ?: dirname(__DIR__) . '/files', '/\\');
$AUTH_FILE = $PRIVATE_DIR . '/auth.php';
$ATTEMPTS_FILE = $PRIVATE_DIR . '/attempts.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
header('Referrer-Policy: no-referrer');

// ---------------------------------------------------------------------------- helpers

function respond(int $status, array $body = []): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $message, string $code = 'error', array $params = []): void
{
    respond($status, ['error' => $message, 'code' => $code, 'params' => (object)$params]);
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

function ensure_private_dir(string $dir): void
{
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        fail(500, 'Cannot create private storage');
    }
    $htaccess = $dir . '/.htaccess';
    if (!is_file($htaccess)) {
        file_put_contents(
            $htaccess,
            "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n" .
            "<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n"
        );
    }
}

/** Reads a private "<?php return [...];" file. */
function read_private(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }
    if (function_exists('opcache_invalidate')) {
        opcache_invalidate($file, true);
    }
    $data = include $file;
    return is_array($data) ? $data : null;
}

function export_private(array $data): string
{
    return "<?php\n// Generated file. Do not edit or publish.\nreturn " . var_export($data, true) . ";\n";
}

/** Atomic write: temp file in the same directory + rename. */
function write_atomic(string $file, string $contents): void
{
    $tmp = $file . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (file_put_contents($tmp, $contents, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        fail(500, 'Cannot write file');
    }
}

function hash_algo()
{
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
}

function hash_options(): array
{
    return defined('PASSWORD_ARGON2ID')
        ? ['memory_cost' => 65536, 'time_cost' => 4, 'threads' => 1]
        : ['cost' => 12];
}

function hash_password(string $password): string
{
    $hash = password_hash($password, hash_algo(), hash_options());
    if (!is_string($hash)) {
        fail(500, 'Hashing failed');
    }
    return $hash;
}

function validate_new_password($password): string
{
    if (!is_string($password)) {
        fail(400, 'Missing password', 'passwordMissing');
    }
    $len = mb_strlen($password, 'UTF-8');
    if ($len < MIN_PASSWORD_LENGTH) {
        fail(400, 'The password must be at least ' . MIN_PASSWORD_LENGTH . ' characters long', 'passwordTooShort', ['min' => MIN_PASSWORD_LENGTH]);
    }
    if ($len > MAX_PASSWORD_LENGTH) {
        fail(400, 'Password too long', 'passwordTooLong');
    }
    return $password;
}

function json_body(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 1024 * 1024);
    $data = json_decode($raw ?: '', true);
    if (!is_array($data)) {
        fail(400, 'Invalid JSON body');
    }
    return $data;
}

// ---------------------------------------------------------------------------- session

function start_session(): void
{
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    session_name('pf_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    $now = time();
    if (!empty($_SESSION['auth'])) {
        $idle = $now - ($_SESSION['last_seen'] ?? 0);
        $age = $now - ($_SESSION['logged_at'] ?? 0);
        if ($idle > SESSION_IDLE_SECONDS || $age > SESSION_MAX_SECONDS) {
            $_SESSION = [];
            session_regenerate_id(true);
        } else {
            $_SESSION['last_seen'] = $now;
        }
    }
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function login_session(): void
{
    session_regenerate_id(true);
    $_SESSION['auth'] = true;
    $_SESSION['logged_at'] = time();
    $_SESSION['last_seen'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function require_auth(): void
{
    if (empty($_SESSION['auth'])) {
        fail(401, 'Session expired, please log in again', 'sessionExpired');
    }
}

function check_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'], $sent)) {
        fail(403, 'Invalid CSRF token, reload the page', 'csrfInvalid');
    }
}

// ---------------------------------------------------------------------------- brute force

function client_key(): string
{
    return hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
}

/** Runs $fn with the attempts table under an exclusive lock and saves what it returns. */
function with_attempts(string $file, callable $fn)
{
    $lock = fopen($file . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        fail(500, 'Lock failed');
    }
    try {
        $table = read_private($file) ?? [];
        $now = time();
        foreach ($table as $k => $row) { // forget stale entries
            if (($row['until'] ?? 0) < $now && ($row['last'] ?? 0) < $now - LOCKOUT_SECONDS) {
                unset($table[$k]);
            }
        }
        [$table, $result] = $fn($table, $now);
        write_atomic($file, export_private($table));
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function assert_not_locked(string $file): void
{
    $key = client_key();
    $wait = with_attempts($file, function (array $t, int $now) use ($key) {
        $until = $t[$key]['until'] ?? 0;
        return [$t, $until > $now ? $until - $now : 0];
    });
    if ($wait > 0) {
        header('Retry-After: ' . $wait);
        fail(429, 'Too many attempts. Try again in ' . (int)ceil($wait / 60) . ' minutes', 'tooManyAttempts', ['minutes' => (int)ceil($wait / 60)]);
    }
}

function register_failure(string $file): void
{
    $key = client_key();
    with_attempts($file, function (array $t, int $now) use ($key) {
        $row = $t[$key] ?? ['count' => 0, 'until' => 0, 'last' => 0];
        $row['count']++;
        $row['last'] = $now;
        if ($row['count'] >= MAX_FAILED_LOGINS) {
            $row['until'] = $now + LOCKOUT_SECONDS;
            $row['count'] = 0;
        }
        $t[$key] = $row;
        return [$t, null];
    });
}

function clear_failures(string $file): void
{
    $key = client_key();
    with_attempts($file, function (array $t) use ($key) {
        unset($t[$key]);
        return [$t, null];
    });
}

/** Verifies $password against the stored hash, with lockout and transparent rehash. */
function verify_password($password, string $authFile, string $attemptsFile): void
{
    assert_not_locked($attemptsFile);
    $auth = read_private($authFile);
    if (!$auth || empty($auth['hash'])) {
        fail(409, 'Password not set yet', 'passwordNotSet');
    }
    if (!is_string($password) || strlen($password) > MAX_PASSWORD_LENGTH * 4
        || !password_verify($password, $auth['hash'])) {
        register_failure($attemptsFile);
        fail(401, 'Wrong password', 'wrongPassword');
    }
    clear_failures($attemptsFile);
    if (password_needs_rehash($auth['hash'], hash_algo(), hash_options())) {
        $auth['hash'] = hash_password($password);
        write_atomic($authFile, export_private($auth));
    }
}

// ---------------------------------------------------------------------------- content validation

function str_field(array $src, string $key, bool $required = true, int $max = MAX_TEXT_LENGTH): ?string
{
    if (!array_key_exists($key, $src) || $src[$key] === null || $src[$key] === '') {
        if ($required && !array_key_exists($key, $src)) {
            fail(400, "Missing field: $key", 'fieldMissing', ['field' => $key]);
        }
        return $required ? '' : null;
    }
    if (!is_string($src[$key])) {
        fail(400, "Invalid field: $key", 'fieldInvalid', ['field' => $key]);
    }
    if (mb_strlen($src[$key], 'UTF-8') > $max) {
        fail(400, "Field too long: $key", 'fieldTooLong', ['field' => $key]);
    }
    return $src[$key];
}

function list_field(array $src, string $key): array
{
    $list = $src[$key] ?? null;
    if (!is_array($list) || !array_is_list($list)) {
        fail(400, "Invalid list: $key", 'fieldInvalid', ['field' => $key]);
    }
    if (count($list) > MAX_LIST_ITEMS) {
        fail(400, "Too many items: $key", 'tooManyItems', ['field' => $key]);
    }
    foreach ($list as $item) {
        if (!is_array($item)) {
            fail(400, "Invalid item in $key", 'fieldInvalid', ['field' => $key]);
        }
    }
    return $list;
}

function color_field(array $src, string $key): string
{
    $v = $src[$key] ?? null;
    if (!is_string($v) || !preg_match('/^#[0-9a-fA-F]{6}$/', $v)) {
        fail(400, "Invalid color: $key", 'colorInvalid', ['field' => $key]);
    }
    return strtolower($v);
}

function enum_field(array $src, string $key, array $allowed): string
{
    $v = $src[$key] ?? null;
    if (!is_string($v) || !in_array($v, $allowed, true)) {
        fail(400, "Invalid value: $key", 'fieldInvalid', ['field' => $key]);
    }
    return $v;
}

/** Returns the sanitized document to store, or fails. */
/** Dashboard translation catalog: nested objects whose leaves are strings (keys checked, never paths). */
function translation_tree($node, string $path, int $depth, int &$count): array
{
    if (!is_array($node) || (count($node) > 0 && array_is_list($node)) || $depth > MAX_TRANSLATION_DEPTH) {
        fail(400, "Invalid value: $path", 'fieldInvalid', ['field' => $path]);
    }
    $out = [];
    foreach ($node as $key => $value) {
        $key = (string)$key;
        $field = "$path.$key";
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,63}$/', $key)) {
            fail(400, "Invalid field: $path", 'fieldInvalid', ['field' => $path]);
        }
        if (is_string($value)) {
            if (++$count > MAX_TRANSLATION_STRINGS) {
                fail(400, "Too many items: $path", 'tooManyItems', ['field' => $path]);
            }
            if (mb_strlen($value, 'UTF-8') > MAX_TRANSLATION_LENGTH) {
                fail(400, "Field too long: $field", 'fieldTooLong', ['field' => $field]);
            }
            $out[$key] = $value;
        } else {
            $out[$key] = (object)translation_tree($value, $field, $depth + 1, $count);
        }
    }
    return $out;
}

function sanitize_document(string $name, array $doc, string $filesDir): array
{
    switch ($name) {
        case 'aboutMe.json':
            return ['aboutMe' => str_field($doc, 'aboutMe')];
        case 'contacts.json':
            return ['contacts' => str_field($doc, 'contacts')];
        case 'expertise.json':
            return ['expertise' => str_field($doc, 'expertise')];
        case 'educationContent.json':
            return ['educationPaths' => array_map(fn($i) => [
                'timePeriod' => str_field($i, 'timePeriod', true, 200),
                'description' => str_field($i, 'description'),
            ], list_field($doc, 'educationPaths'))];
        case 'experienceContent.json':
            return ['educationPaths' => array_map(fn($i) => array_filter([
                'timePeriod' => str_field($i, 'timePeriod', true, 200),
                'title' => str_field($i, 'title', true, 500),
                'description' => str_field($i, 'description'),
                'activities' => str_field($i, 'activities', false),
                'technologiesAndTools' => str_field($i, 'technologiesAndTools', false),
            ], fn($v) => $v !== null), list_field($doc, 'educationPaths'))];
        case 'profile.json':
            // The image is managed only by the upload action: keep what is on disk.
            $current = json_decode((string)@file_get_contents($filesDir . '/profile.json'), true) ?: [];
            return [
                'name' => str_field($doc, 'name', true, 100),
                'surname' => str_field($doc, 'surname', true, 100),
                'jobtitle' => str_field($doc, 'jobtitle', true, 200),
                'image' => is_string($current['image'] ?? null) ? $current['image'] : 'profile.jpg',
                'imageVersion' => (int)($current['imageVersion'] ?? 1),
            ];
        case 'theme.json':
            $fonts = ['system', 'inter', 'roboto', 'lato', 'poppins', 'montserrat',
                'merriweather', 'playfair', 'sourcecode'];
            $palette = function (string $key) use ($doc): array {
                $colors = $doc[$key] ?? null;
                if (!is_array($colors)) {
                    fail(400, "Missing field: $key", 'fieldMissing', ['field' => $key]);
                }
                return [
                    'sidebarBackground' => color_field($colors, 'sidebarBackground'),
                    'sidebarText' => color_field($colors, 'sidebarText'),
                    'accent' => color_field($colors, 'accent'),
                    'background' => color_field($colors, 'background'),
                    'text' => color_field($colors, 'text'),
                    'title' => color_field($colors, 'title'),
                ];
            };
            $size = $doc['fontSize'] ?? null;
            if (!is_int($size) || $size < 12 || $size > 22) {
                fail(400, 'Invalid font size (12-22)', 'fontSizeInvalid');
            }
            return [
                'mode' => enum_field($doc, 'mode', ['light', 'dark']),
                'colors' => $palette('colors'),
                'darkColors' => $palette('darkColors'),
                'fontFamily' => enum_field($doc, 'fontFamily', $fonts),
                'headingFontFamily' => enum_field($doc, 'headingFontFamily', $fonts),
                'fontSize' => $size,
                'imageShape' => enum_field($doc, 'imageShape', ['square', 'rounded', 'circle']),
            ];
        case 'translations.json':
            $languages = $doc['languages'] ?? null;
            if (!is_array($languages) || (count($languages) > 0 && array_is_list($languages))) {
                fail(400, 'Invalid value: languages', 'fieldInvalid', ['field' => 'languages']);
            }
            if (count($languages) > MAX_LANGUAGES) {
                fail(400, 'Too many items: languages', 'tooManyItems', ['field' => 'languages']);
            }
            $clean = [];
            foreach ($languages as $code => $catalog) {
                $code = (string)$code;
                if (!preg_match('/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/', $code)) {
                    fail(400, "Invalid language code: $code", 'languageCodeInvalid', ['code' => $code]);
                }
                $count = 0;
                $clean[$code] = (object)translation_tree($catalog, $code, 0, $count);
            }
            // Objects, so an empty list is still written as {} and not [].
            return ['languages' => (object)$clean];
    }
    fail(400, 'Document not editable', 'documentNotEditable');
}

/** Path of a translated document; both parts are whitelisted/validated, never used raw. */
function translation_file(string $filesDir, $name, $language): string
{
    if (!is_string($name) || !in_array($name, LOCALIZABLE, true)) {
        fail(400, 'Document not editable', 'documentNotEditable');
    }
    if (!is_string($language) || $language === DEFAULT_LANGUAGE
        || !preg_match('/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/', $language)) {
        fail(400, 'Invalid language code: ' . (is_string($language) ? $language : ''), 'languageCodeInvalid',
            ['code' => is_string($language) ? $language : '']);
    }
    return "$filesDir/i18n/$language/$name";
}

function write_json_document(string $file, array $doc): void
{
    $json = json_encode($doc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        fail(400, 'Content cannot be serialized', 'contentInvalid');
    }
    write_atomic($file, $json . "\n");
}

// ---------------------------------------------------------------------------- routing

ensure_private_dir($PRIVATE_DIR);
start_session();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = (string)($_GET['action'] ?? '');

if ($method === 'GET' && $action === 'status') {
    respond(200, [
        'configured' => is_file($AUTH_FILE),
        'authenticated' => !empty($_SESSION['auth']),
        'csrf' => $_SESSION['csrf'],
        'minPasswordLength' => MIN_PASSWORD_LENGTH,
    ]);
}

if ($method !== 'POST') {
    fail(405, 'Method not allowed');
}
check_csrf();

switch ($action) {
    case 'setup':
        $password = validate_new_password(json_body()['password'] ?? null);
        $hash = hash_password($password);
        // 'x' = create only if it does not exist: the password can be set only once,
        // even with concurrent requests.
        $fh = @fopen($AUTH_FILE, 'x');
        if ($fh === false) {
            fail(409, 'The password has already been set', 'passwordAlreadySet');
        }
        fwrite($fh, export_private(['hash' => $hash, 'createdAt' => gmdate('c')]));
        fclose($fh);
        @chmod($AUTH_FILE, 0600);
        login_session();
        respond(200, ['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'login':
        verify_password(json_body()['password'] ?? null, $AUTH_FILE, $ATTEMPTS_FILE);
        login_session();
        respond(200, ['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'logout':
        $_SESSION = [];
        session_regenerate_id(true);
        session_destroy();
        respond(200, ['ok' => true]);

    case 'change-password':
        require_auth();
        $body = json_body();
        verify_password($body['currentPassword'] ?? null, $AUTH_FILE, $ATTEMPTS_FILE);
        $new = validate_new_password($body['newPassword'] ?? null);
        $auth = read_private($AUTH_FILE) ?? [];
        $auth['hash'] = hash_password($new);
        $auth['changedAt'] = gmdate('c');
        write_atomic($AUTH_FILE, export_private($auth));
        login_session();
        respond(200, ['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'save':
        require_auth();
        $body = json_body();
        $name = $body['document'] ?? '';
        $doc = $body['content'] ?? null;
        if (!is_string($name) || !is_array($doc)) {
            fail(400, 'Invalid request', 'badRequest');
        }
        $language = $body['language'] ?? null;
        if ($language === null || $language === '' || $language === DEFAULT_LANGUAGE) {
            $clean = sanitize_document($name, $doc, $FILES_DIR);
            write_json_document($FILES_DIR . '/' . $name, $clean); // $name is whitelisted above
            respond(200, ['ok' => true, 'content' => $clean]);
        }
        $file = translation_file($FILES_DIR, $name, $language);
        // A translated profile only carries the texts that change with the language.
        $clean = $name === 'profile.json'
            ? ['jobtitle' => str_field($doc, 'jobtitle', true, 200)]
            : sanitize_document($name, $doc, $FILES_DIR);
        $dir = dirname($file);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            fail(500, 'Cannot write file');
        }
        write_json_document($file, $clean);
        respond(200, ['ok' => true, 'content' => $clean]);

    case 'delete-translation':
        require_auth();
        $body = json_body();
        $file = translation_file($FILES_DIR, $body['document'] ?? null, $body['language'] ?? null);
        if (is_file($file) && !unlink($file)) {
            fail(500, 'Cannot write file');
        }
        respond(200, ['ok' => true]);

    case 'upload-image':
        require_auth();
        $file = $_FILES['image'] ?? null;
        if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
            || !is_uploaded_file($file['tmp_name'])) {
            fail(400, 'No image received', 'imageMissing');
        }
        if ($file['size'] > MAX_IMAGE_BYTES) {
            fail(400, 'Image too large (max 5 MB)', 'imageTooLarge');
        }
        $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $info = @getimagesize($file['tmp_name']);
        if (!isset($types[$mime]) || !$info || $info['mime'] !== $mime
            || $info[0] < 1 || $info[1] < 1
            || $info[0] > MAX_IMAGE_SIDE || $info[1] > MAX_IMAGE_SIDE) {
            fail(400, 'Unsupported format: use JPG, PNG or WEBP', 'imageFormat');
        }
        // Fixed, server-chosen name: the client never controls the path or extension.
        $target = 'profile.' . $types[$mime];
        if (!move_uploaded_file($file['tmp_name'], $FILES_DIR . '/' . $target)) {
            fail(500, 'Saving the image failed', 'imageSaveFailed');
        }
        @chmod($FILES_DIR . '/' . $target, 0644);
        foreach ($types as $ext) {
            if ("profile.$ext" !== $target) {
                @unlink($FILES_DIR . "/profile.$ext");
            }
        }
        $profile = json_decode((string)@file_get_contents($FILES_DIR . '/profile.json'), true) ?: [];
        $profile['image'] = $target;
        $profile['imageVersion'] = time();
        write_json_document($FILES_DIR . '/profile.json', $profile + ['name' => '', 'surname' => '', 'jobtitle' => '']);
        respond(200, ['ok' => true, 'content' => $profile]);
}

fail(404, 'Unknown action');
