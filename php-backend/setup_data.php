<?php
require_once 'config.php';
$db = get_db_connection();

// 1. Create default admin if missing
$check = $db->prepare("SELECT id FROM users WHERE email = ?");
$check->execute(['admin@smartbin.com']);
if (!$check->fetch()) {
    $pass = password_hash('admin123', PASSWORD_DEFAULT);
    $db->prepare("INSERT INTO users (name, email, password, role, status) VALUES ('Super Admin', 'admin@smartbin.com', ?, 'admin', 'approved')")->execute([$pass]);
    echo "Admin created. ";
}

// 2. Create sample collector if missing
$check = $db->prepare("SELECT id FROM users WHERE email = ?");
$check->execute(['collector@smartbin.com']);
if (!$check->fetch()) {
    $pass = password_hash('collector123', PASSWORD_DEFAULT);
    $db->prepare("INSERT INTO users (name, email, password, role, status) VALUES ('John Collector', 'collector@smartbin.com', ?, 'collector', 'Active')")->execute([$pass]);
    $uid = $db->lastInsertId();
    $db->prepare("INSERT INTO collectors_info (user_id, zone, status) VALUES (?, 'Zone A', 'Active')")->execute([$uid]);
    $db->prepare("INSERT INTO vehicles (collector_id, vehicle_number, capacity) VALUES (?, 'MH-12-SB-101', '5 tons')")->execute([$uid]);
    $db->prepare("INSERT INTO routes (collector_id, name, status) VALUES (?, 'Pimpri Central Route', 'pending')")->execute([$uid]);
    echo "Collector created. ";
}

echo "Setup complete.";
?>
