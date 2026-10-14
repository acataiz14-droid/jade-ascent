<?php
/**
 * Jade Ascent - Student Progress & Parent/Admin Review API
 * Stores synced student profiles and teacher developmental reviews in JSON files.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data_store';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$profilesFile = $dataDir . '/profiles.json';
$reviewsFile  = $dataDir . '/reviews.json';

function readJsonFile($path, $default = []) {
    if (!file_exists($path)) {
        return $default;
    }
    $raw = @file_get_contents($path);
    if (!$raw) return $default;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $default;
}

function writeJsonFile($path, $data) {
    @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

if ($action === 'list') {
    $profiles = readJsonFile($profilesFile, []);
    $reviews  = readJsonFile($reviewsFile, []);
    echo json_encode([
        'ok' => true,
        'profiles' => $profiles,
        'reviews' => $reviews,
        'serverTime' => round(microtime(true) * 1000)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);
if (!is_array($body)) {
    $body = $_POST;
}

if ($action === 'sync_profile') {
    $profile = isset($body['profile']) ? $body['profile'] : null;
    if (!$profile || empty($profile['userId'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid profile data']);
        exit;
    }
    $profiles = readJsonFile($profilesFile, []);
    $userId = $profile['userId'];
    $profiles[$userId] = $profile;
    writeJsonFile($profilesFile, $profiles);

    echo json_encode(['ok' => true, 'userId' => $userId], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'save_review') {
    $adminId   = isset($body['adminId']) ? trim($body['adminId']) : '';
    $adminPass = isset($body['adminPass']) ? trim($body['adminPass']) : '';

    if (strtolower($adminId) !== 'toon' || $adminPass !== '141826') {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'รหัสแอดมินไม่ถูกต้อง']);
        exit;
    }

    $review = isset($body['review']) ? $body['review'] : null;
    if (!$review || empty($review['studentId'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'ข้อมูลรีวิวไม่ครบถ้วน']);
        exit;
    }

    // If a custom student profile was also provided by admin, save/update it
    if (!empty($body['profile']) && !empty($body['profile']['userId'])) {
        $profiles = readJsonFile($profilesFile, []);
        $profiles[$body['profile']['userId']] = $body['profile'];
        writeJsonFile($profilesFile, $profiles);
    }

    $reviews = readJsonFile($reviewsFile, []);
    $studentId = $review['studentId'];
    $review['updatedAt'] = round(microtime(true) * 1000);
    $reviews[$studentId] = $review;
    writeJsonFile($reviewsFile, $reviews);

    echo json_encode([
        'ok' => true,
        'review' => $review
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'delete_review') {
    $adminId   = isset($body['adminId']) ? trim($body['adminId']) : '';
    $adminPass = isset($body['adminPass']) ? trim($body['adminPass']) : '';

    if (strtolower($adminId) !== 'toon' || $adminPass !== '141826') {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'รหัสแอดมินไม่ถูกต้อง']);
        exit;
    }

    $studentId = isset($body['studentId']) ? $body['studentId'] : '';
    $reviews = readJsonFile($reviewsFile, []);
    if (isset($reviews[$studentId])) {
        unset($reviews[$studentId]);
        writeJsonFile($reviewsFile, $reviews);
    }

    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
