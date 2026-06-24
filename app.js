async function validarDocumento() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const contenedor = document.getElementById("resultado");

  if (!id) {
    contenedor.innerHTML = `<p class="error">No se indicó un código de validación.</p>`;
    return;
  }

  try {
    const respuesta = await fetch("poderes.json");
    const poderes = await respuesta.json();
    const poder = poderes[id];

    if (!poder) {
      contenedor.innerHTML = `
        <p class="estado error">Documento no encontrado</p>
        <p>El código <strong>${id}</strong> no existe en nuestros registros públicos de validación.</p>
      `;
      return;
    }

    const claseEstado = poder.estado === "Vigente" ? "vigente" : "error";

    contenedor.innerHTML = `
      <p class="estado ${claseEstado}">${poder.estado}</p>
      <div class="fila"><strong>Código:</strong> ${id}</div>
      <div class="fila"><strong>Razón social:</strong> ${poder.razonSocial}</div>
      <div class="fila"><strong>RUT:</strong> ${poder.rut}</div>
      <div class="fila"><strong>Tipo documento:</strong> ${poder.tipoDocumento}</div>
      <div class="fila"><strong>Fecha emisión:</strong> ${poder.fechaEmision}</div>
      <div class="fila"><strong>Fecha vencimiento:</strong> ${poder.fechaVencimiento}</div>
      <div class="fila"><strong>Versión:</strong> ${poder.version}</div>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">No fue posible cargar la validación.</p>`;
  }
}

validarDocumento();
