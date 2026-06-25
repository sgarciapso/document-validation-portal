function obtenerMensajeEstado(estado) {
  switch (estado) {
    case "Vigente":
      return "Este documento se encuentra vigente según nuestros registros.";

    case "Revocado":
      return "Este documento fue revocado y no debe ser utilizado.";

    case "Vencido":
      return "Este documento superó su fecha de vigencia y ya no debe ser utilizado.";

    case "Reemplazado":
      return "Este documento fue reemplazado por una versión posterior.";

    default:
      return "El estado de este documento no pudo ser determinado.";
  }
}

function obtenerCarpetaPorCodigo(codigo) {
  if (codigo.startsWith("POD-")) {
    return "poderes";
  }

  if (codigo.startsWith("ADO-")) {
    return "autorizaciones_domicilio";
  }

  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const codigo = url.pathname.replace("/", "").trim();

    if (!codigo) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", url)));
    }

    const carpeta = obtenerCarpetaPorCodigo(codigo);
    
    if (!carpeta) {
      return new Response("Tipo de documento no reconocido", { status: 400 });
    }

    const archivo = new URL(`/data/${carpeta}/${codigo}.json`, url);
    const respuesta = await env.ASSETS.fetch(new Request(archivo));

    if (respuesta.status === 404) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documento no encontrado</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <main class="card">
            <h1>Validación de Documento</h1>
            <h2>Documento no encontrado</h2>
            <p>El código <strong>${codigo}</strong> no existe en nuestros registros públicos de validación.</p>
          </main>
        </body>
        </html>
      `, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=UTF-8" }
      });
    }

    const data = await respuesta.json();
    const mensajeEstado = obtenerMensajeEstado(data.estado);

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

          <h2>${data.estado}</h2>
          <p>${mensajeEstado}</p>

          <hr>

          <p><strong>Código:</strong> ${data.codigo}</p>
          <p><strong>Razón social:</strong> ${data.empresa.razonSocial}</p>
          <p><strong>RUT:</strong> ${data.empresa.rut}</p>
          <p><strong>Tipo:</strong> ${data.tipoDocumento}</p>
          <p><strong>Emisión:</strong> ${data.vigencia.emision}</p>
          <p><strong>Vencimiento:</strong> ${data.vigencia.vencimiento}</p>
          <p><strong>Versión:</strong> ${data.vigencia.version}</p>

          <br></br>
                   
          <p><strong>Firmado electrónicamente:</strong> ${data.firmado ? "Sí" : "No"}</p>
          <p><strong>Tipo de firma:</strong> ${data.tipoFirma}</p>
          <p><strong>Emitido por:</strong> ${data.emitidoPor}</p>
          <p><strong>Fecha firma:</strong> ${data.fechaFirma}</p>
          <p><strong>Firmado por:</strong> ${data.firmante}</p>
          
        </main>
      </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=UTF-8" }
    });
  }
}
