export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let codigo = url.pathname.replace("/", "").trim();

    if (!codigo) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", url)));
    }

    const archivo = new URL(`/data/${codigo}.json`, url);
    const respuesta = await env.ASSETS.fetch(new Request(archivo));

    if (respuesta.status === 404) {
      return new Response("Documento no encontrado", { status: 404 });
    }

    const data = await respuesta.json();

    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validación de Documento</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <main class="card">
          <h1>Validación de Documento</h1>
          <p class="estado">${data.estado}</p>
          <p><strong>Código:</strong> ${data.codigo}</p>
          <p><strong>Razón social:</strong> ${data.razonSocial}</p>
          <p><strong>RUT:</strong> ${data.rut}</p>
          <p><strong>Tipo:</strong> ${data.tipo}</p>
          <p><strong>Emisión:</strong> ${data.fechaEmision}</p>
          <p><strong>Vencimiento:</strong> ${data.fechaVencimiento}</p>
        </main>
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=UTF-8" }
    });
  }
}
