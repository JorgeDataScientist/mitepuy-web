<?php

// =========================
// CONFIGURACIÓN
// =========================

$to = "contacto@mitepuy.com";
$subject = "Nuevo mensaje desde MiTepuy";

// =========================
// RESPUESTA COMO TEXTO
// =========================

header("Content-Type: text/plain; charset=UTF-8");

// =========================
// VALIDAR MÉTODO POST
// =========================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Acceso no permitido.");
}

// =========================
// LIMPIAR DATOS
// =========================

function clean_input($data) {
    $data = trim($data);
    $data = strip_tags($data);
    $data = htmlspecialchars($data, ENT_QUOTES, "UTF-8");
    return $data;
}

$full_name = clean_input($_POST["full_name"] ?? "");
$email = clean_input($_POST["email"] ?? "");
$whatsapp = clean_input($_POST["whatsapp"] ?? "");
$city_state = clean_input($_POST["city_state"] ?? "");
$message = clean_input($_POST["message"] ?? "");

// =========================
// VALIDAR CAMPOS OBLIGATORIOS
// =========================

if (
    empty($full_name) ||
    empty($email) ||
    empty($whatsapp) ||
    empty($city_state) ||
    empty($message)
) {
    http_response_code(400);
    exit("Todos los campos son obligatorios.");
}

// =========================
// VALIDAR LONGITUDES
// =========================

if (mb_strlen($full_name) < 3 || mb_strlen($full_name) > 50) {
    http_response_code(400);
    exit("El nombre debe tener entre 3 y 50 caracteres.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 100) {
    http_response_code(400);
    exit("El correo electrónico no es válido.");
}

if (mb_strlen($whatsapp) < 8 || mb_strlen($whatsapp) > 20) {
    http_response_code(400);
    exit("El WhatsApp debe tener entre 8 y 20 caracteres.");
}

if (mb_strlen($city_state) < 3 || mb_strlen($city_state) > 60) {
    http_response_code(400);
    exit("La ciudad o estado debe tener entre 3 y 60 caracteres.");
}

if (mb_strlen($message) < 10 || mb_strlen($message) > 350) {
    http_response_code(400);
    exit("El mensaje debe tener entre 10 y 350 caracteres.");
}

// =========================
// VALIDACIÓN BÁSICA ANTI-INJECTION
// =========================

if (
    preg_match("/[\r\n]/", $email) ||
    preg_match("/[\r\n]/", $full_name)
) {
    http_response_code(400);
    exit("Datos no válidos.");
}

// =========================
// CONTENIDO DEL EMAIL
// =========================

$body = "
Nuevo mensaje recibido desde MiTepuy.com

=================================

Nombre:
$full_name

Correo:
$email

WhatsApp:
$whatsapp

Ciudad / Estado:
$city_state

Mensaje:
$message

=================================
";

// =========================
// HEADERS
// =========================

$headers = "From: MiTepuy <contacto@mitepuy.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// =========================
// ENVIAR EMAIL
// =========================

if (mail($to, $subject, $body, $headers)) {
    echo "success";
} else {
    http_response_code(500);
    echo "error";
}

?>