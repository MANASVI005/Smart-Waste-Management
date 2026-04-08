<?php
$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Try empty first
$db = 'smart_bin';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    echo "SUCCESS: Connected to database.";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
