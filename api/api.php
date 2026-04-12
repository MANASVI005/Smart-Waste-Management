<?php
require_once 'config.php';

// Prepare input data
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Ensure we return JSON
header('Content-Type: application/json');

// Check for authentication on all API routes except public ones (if any)
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit();
}

$user = $_SESSION['user'];

switch ($action) {
    case 'submit-pickup':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $type = $data['type'] ?? 'General Waste';
            $address = $data['address'] ?? '';
            $scheduled_date = $data['scheduled_date'] ?? null;
            $instructions = $data['instructions'] ?? '';

            $db = get_db_connection();
            $stmt = $db->prepare("INSERT INTO pickups (user_id, type, address, scheduled_date, instructions, status) VALUES (?, ?, ?, ?, ?, 'pending')");
            
            if ($stmt->execute([$user['id'], $type, $address, $scheduled_date, $instructions])) {
                echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to submit pickup request']);
            }
        }
        break;

    case 'submit-complaint':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $type = $data['type'] ?? 'Missed Collection';
            $location = $data['location'] ?? '';
            $description = $data['description'] ?? '';

            $db = get_db_connection();
            $stmt = $db->prepare("INSERT INTO complaints (user_id, type, location, description) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$user['id'], $type, $location, $description])) {
                echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to submit complaint']);
            }
        }
        break;

    case 'get-user-pickups':
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT * FROM pickups WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        $pickups = $stmt->fetchAll();
        echo json_encode(['success' => true, 'pickups' => $pickups]);
        break;

    case 'get-all-pickups':
        // Only for Collector or Admin
        if ($user['role'] !== 'collector' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT p.*, u.name as resident_name, u.email as resident_email, u.phone as resident_phone FROM pickups p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC");
        $stmt->execute();
        $pickups = $stmt->fetchAll();
        echo json_encode(['success' => true, 'pickups' => $pickups]);
        break;

    case 'update-pickup-status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $pickup_id = $data['pickup_id'] ?? 0;
            $status = $data['status'] ?? 'pending';

            if ($user['role'] !== 'collector' && $user['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Access denied']);
                break;
            }

            $db = get_db_connection();
            $stmt = $db->prepare("UPDATE pickups SET status = ? WHERE id = ?");
            if ($stmt->execute([$status, $pickup_id])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update status']);
            }
        }
        break;

    case 'get-collector-stats':
        if ($user['role'] !== 'collector' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        
        // Get vehicle info
        $vStmt = $db->prepare("SELECT * FROM vehicles WHERE collector_id = ? LIMIT 1");
        $vStmt->execute([$user['id']]);
        $vehicle = $vStmt->fetch();

        // Get route info
        $rStmt = $db->prepare("SELECT * FROM routes WHERE collector_id = ? AND status != 'completed' LIMIT 1");
        $rStmt->execute([$user['id']]);
        $route = $rStmt->fetch();

        // Get counts
        $cStmt = $db->prepare("SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
            COUNT(CASE WHEN status = 'completed' AND DATE(created_at) = CURDATE() THEN 1 END) as completed_today
            FROM pickups");
        $cStmt->execute();
        $counts = $cStmt->fetch();

        echo json_encode([
            'success' => true,
            'vehicle' => $vehicle,
            'route' => $route,
            'stats' => $counts
        ]);
        break;

    case 'get-residents':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT id, name, email, phone, address, status, created_at FROM users WHERE role = 'resident' ORDER BY created_at DESC");
        $stmt->execute();
        $residents = $stmt->fetchAll();
        echo json_encode(['success' => true, 'residents' => $residents]);
        break;

    case 'get-all-collectors':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT u.id, u.name, u.email, u.phone, ci.zone, ci.status, v.vehicle_number, v.capacity 
                             FROM users u 
                             LEFT JOIN collectors_info ci ON u.id = ci.user_id 
                             LEFT JOIN vehicles v ON u.id = v.collector_id 
                             WHERE u.role = 'collector' 
                             ORDER BY u.name ASC");
        $stmt->execute();
        $collectors = $stmt->fetchAll();
        echo json_encode(['success' => true, 'collectors' => $collectors]);
        break;

    case 'update-collector-status':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_id = $data['user_id'] ?? 0;
            $status = $data['status'] ?? 'Active';
            $db = get_db_connection();
            $stmt = $db->prepare("UPDATE collectors_info SET status = ? WHERE user_id = ?");
            if ($stmt->execute([$status, $user_id])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update collector status']);
            }
        }
        break;

    case 'add-collector':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $phone = $data['phone'] ?? '';
            $password = password_hash($data['password'] ?? 'collector123', PASSWORD_DEFAULT);
            $zone = $data['zone'] ?? 'Zone A';
            $vehicle_number = $data['vehicle_number'] ?? 'TR-' . rand(100,999);

            $db = get_db_connection();
            $db->beginTransaction();
            try {
                // 1. Create User
                $uStmt = $db->prepare("INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'collector', 'approved')");
                $uStmt->execute([$name, $email, $phone, $password]);
                $user_id = $db->lastInsertId();

                // 2. Create Collector Info
                $ciStmt = $db->prepare("INSERT INTO collectors_info (user_id, zone, status) VALUES (?, ?, 'Active')");
                $ciStmt->execute([$user_id, $zone]);

                // 3. Create Vehicle
                $vStmt = $db->prepare("INSERT INTO vehicles (collector_id, vehicle_number, capacity) VALUES (?, ?, '5 tons')");
                $vStmt->execute([$user_id, $vehicle_number]);

                $db->commit();
                echo json_encode(['success' => true, 'user_id' => $user_id]);
            } catch (Exception $e) {
                $db->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add collector: ' . $e->getMessage()]);
            }
        }
        break;

    case 'get-analytics':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        
        // Waste by category
        $wStmt = $db->prepare("SELECT type as category, COUNT(*) as count FROM pickups GROUP BY type");
        $wStmt->execute();
        $waste_stats = $wStmt->fetchAll();

        // Completion rate
        $cStmt = $db->prepare("SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM pickups");
        $cStmt->execute();
        $completion = $cStmt->fetch();

        echo json_encode([
            'success' => true,
            'waste_stats' => $waste_stats,
            'completion' => $completion
        ]);
        break;

    case 'update-resident-status':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_id = $data['user_id'] ?? 0;
            $status = $data['status'] ?? 'pending';
            $db = get_db_connection();
            $stmt = $db->prepare("UPDATE users SET status = ? WHERE id = ?");
            if ($stmt->execute([$status, $user_id])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update resident status']);
            }
        }
        break;

    case 'start-collection':
        if ($user['role'] !== 'collector' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        $stmt = $db->prepare("UPDATE routes SET status = 'in-progress' WHERE collector_id = ? AND status = 'pending'");
        if ($stmt->execute([$user['id']])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to start collection']);
        }
        break;

    case 'get-all-stats':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        
        // General counts
        $uCount = $db->query("SELECT COUNT(*) FROM users WHERE role = 'resident'")->fetchColumn();
        $cCount = $db->query("SELECT COUNT(*) FROM users WHERE role = 'collector' AND status = 'Active'")->fetchColumn();
        $pCount = $db->query("SELECT COUNT(*) FROM pickups WHERE status = 'completed'")->fetchColumn();
        
        // Waste by type (for donut chart)
        $wStmt = $db->query("SELECT type, COUNT(*) as count FROM pickups GROUP BY type");
        $waste_breakdown = $wStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'stats' => [
                'collectors' => $cCount,
                'residents' => $uCount,
                'total_pickups' => $pCount,
                'efficiency' => 94, // Mock for now
                'waste_breakdown' => $waste_breakdown
            ]
        ]);
        break;

    case 'get-collector-requests':
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            break;
        }
        $db = get_db_connection();
        $stmt = $db->prepare("SELECT id, name, email, phone, status, created_at FROM users WHERE role = 'collector' AND status = 'pending' ORDER BY created_at DESC");
        $stmt->execute();
        $requests = $stmt->fetchAll();
        echo json_encode(['success' => true, 'requests' => $requests]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found']);
        break;
}
