<?php
header("Content-Type: application/json");
$db = new PDO("sqlite:../db/tasks.db");

// Создание таблицы, если не существует
$db->exec("CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT NOT NULL,
    deadline TEXT NOT NULL,
    category TEXT,
    is_done INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Получить все задачи
    $stmt = $db->query("SELECT * FROM tasks ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    // Добавить новую задачу
    $stmt = $db->prepare("INSERT INTO tasks (title, priority, deadline, category) VALUES (?, ?, ?, ?)");
    $stmt->execute([$input['title'], $input['priority'], $input['deadline'], $input['category']]);

    $id = $db->lastInsertId();
    $task = $db->query("SELECT * FROM tasks WHERE id = $id")->fetch(PDO::FETCH_ASSOC);
    echo json_encode($task);
    exit;
}

if ($method === 'PUT') {
    // Обновить задачу
    $stmt = $db->prepare("UPDATE tasks SET title=?, priority=?, deadline=?, category=?, is_done=? WHERE id=?");
    $stmt->execute([
        $input['title'],
        $input['priority'],
        $input['deadline'],
        $input['category'],
        $input['is_done'],
        $input['id']
    ]);
    echo json_encode(["success" => true]);
    exit;
}

if ($method === 'DELETE') {
    // Удалить задачу
    parse_str(file_get_contents("php://input"), $params);
    $id = $params['id'] ?? 0;
    $stmt = $db->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true]);
    exit;
}
