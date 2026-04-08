<?php
require_once 'config.php';
$db = get_db_connection();

try {
    $db->exec("ALTER TABLE pickups MODIFY COLUMN status ENUM('pending', 'accepted', 'enroute', 'completed', 'rejected', 'cancelled') DEFAULT 'pending'");
    echo "SUCCESS: Database updated with new pickup statuses.";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
