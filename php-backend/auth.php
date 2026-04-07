<?php
require_once 'config.php';

// Prepare input data
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Ensure we return JSON for most requests
header('Content-Type: application/json');

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password = $data['password'] ?? '';

            $db = get_db_connection();
            $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Remove password before sending user data
                unset($user['password']);
                $_SESSION['user'] = $user;
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
            }
        }
        break;

    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = htmlspecialchars($data['name'] ?? '');
            $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
            $role = htmlspecialchars(strip_tags($data['role'] ?? 'resident'));

            $db = get_db_connection();
            
            // Check if user already exists
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User with this email already exists']);
                break;
            }

            // Insert new user
            $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$name, $email, $password, $role])) {
                $user_id = $db->lastInsertId();
                $user = ['id' => $user_id, 'name' => $name, 'email' => $email, 'role' => $role];
                // Automatically log the user in after registration
                $_SESSION['user'] = $user;
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Registration failed']);
            }
        }
        break;

    case 'status':
        if (isset($_SESSION['user'])) {
            echo json_encode(['loggedIn' => true, 'user' => $_SESSION['user']]);
        } else {
            echo json_encode(['loggedIn' => false]);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Auth endpoint not found']);
        break;
}
