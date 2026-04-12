<?php
require_once 'config.php';

try {
    $db = get_db_connection();
    
    // Read the schema file
    $sql_file = '../database/schema.sql';
    if (!file_exists($sql_file)) {
        throw new Exception("Schema file not found at $sql_file");
    }
    
    $sql = file_get_contents($sql_file);
    
    // Split SQL into individual statements
    // This is a simple split, for complex SQL it might need a more robust parser
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "<h1>Database Setup</h1>";
    echo "<ul>";
    
    foreach ($statements as $statement) {
        if (empty($statement)) continue;
        
        try {
            $db->exec($statement);
            echo "<li style='color: green;'>SUCCESS: " . substr($statement, 0, 50) . "...</li>";
        } catch (PDOException $e) {
            echo "<li style='color: orange;'>SKIPPED/ERROR: " . $e->getMessage() . "</li>";
        }
    }
    
    echo "</ul>";
    echo "<h2 style='color: blue;'>Database Initialization Complete!</h2>";
    echo "<p>You can now go back to the home page and Register.</p>";
    echo "<a href='/'>Go to Home Page</a>";

} catch (Exception $e) {
    echo "<h1 style='color: red;'>Setup Failed</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
