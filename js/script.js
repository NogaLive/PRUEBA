document.addEventListener("DOMContentLoaded", () => {
  // Validar sesión antes de continuar
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert("Acceso denegado. Por favor inicia sesión.");
    window.location.href = 'login.html';
    return; // detener la ejecución si no está logueado
  }

  const form = document.getElementById('registroForm');
  const empleados = JSON.parse(localStorage.getItem('empleados')) || [];
  const indexEditar = localStorage.getItem('editIndex');

  // Rellenar el formulario si estamos editando
  if (indexEditar !== null) {
    const emp = empleados[indexEditar];
    if (emp) {
      const inputs = form.querySelectorAll("input, select");
      inputs.forEach((input) => {
        if (input.name && emp[input.name] !== undefined) {
          if (input.type === "checkbox") {
            input.checked = emp[input.name] === true || emp[input.name] === "on";
          } else {
            input.value = emp[input.name];
          }
        }
      });
    }
  }

  function calcularSalarioNeto() {
    const sueldoBase = parseFloat(form.sueldo_base?.value) || 0;
    const horasExtras = parseFloat(form.horas_extras?.value) || 0;
    const tarifaHoraExtra = parseFloat(form.monto_hora?.value) || 0;
    const bonos = parseFloat(form.bonos?.value) || 0;
    const deducciones = parseFloat(form.deducciones?.value) || 0;
    const hijosMenores = parseInt(form.hijos_menores?.value) || 0;
    const tardanzas = parseInt(form.tardanzas?.value) || 0;
    const adelantos = parseFloat(form.adelantos?.value) || 0;
    const planilla = form.planilla?.value || "";
    const puesto = form.puesto?.value || "";
    const esTurnoNocturno = form.turno_nocturno?.checked;
    const trabajaDomingos = form.trabajo_domingos?.checked;

    // Pagos dobles por turnos
    let sueldoConTurnos = sueldoBase;
    if (esTurnoNocturno) sueldoConTurnos += sueldoBase;
    if (trabajaDomingos) sueldoConTurnos += sueldoBase;

    // Bonificación por productividad
    let bonificacionProd = 0;
    if (puesto === "Practicantes") bonificacionProd = sueldoBase * 0.05;
    else if (puesto === "Docente") bonificacionProd = sueldoBase * 0.04;
    else if (puesto === "Personal") bonificacionProd = sueldoBase * 0.02;

    // Asignación familiar: mayor entre 10% del sueldo o S/113 por hijo menor
    const asignacionPorcentaje = sueldoBase * 0.10;
    const asignacionPorHijos = hijosMenores * 113;
    const asignacionFamiliar = Math.max(asignacionPorcentaje, asignacionPorHijos);

    // Descuentos
    const descuentoTardanzas = tardanzas * 5;
    const descuentoAdelantos = adelantos;

    const descuentoPlanilla = planilla.includes("AFP")
      ? sueldoBase * 0.13
      : sueldoBase * 0.10;

    const descuentoEssalud = 92.5;

    const totalDescuentos =
      deducciones +
      descuentoTardanzas +
      descuentoAdelantos +
      descuentoPlanilla +
      descuentoEssalud;

    // Cálculo final
    const salarioNeto =
      sueldoConTurnos +
      (horasExtras * tarifaHoraExtra) +
      bonos +
      bonificacionProd +
      asignacionFamiliar -
      totalDescuentos;

    form.salario_neto.value = salarioNeto.toFixed(2);
    return salarioNeto.toFixed(2);
  }

  // Escuchar cambios en campos que afectan el salario
  [
    'sueldo_base', 'horas_extras', 'monto_hora', 'bonos', 'deducciones',
    'hijos_menores', 'tardanzas', 'adelantos', 'planilla', 'puesto',
    'turno_nocturno', 'trabajo_domingos'
  ].forEach(campo => {
    const input = form[campo];
    if (input) {
      input.addEventListener('input', calcularSalarioNeto);
      if (input.type === "checkbox") {
        input.addEventListener('change', calcularSalarioNeto);
      }
    }
  });

  // Guardar datos
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const data = {};
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach(input => {
      if (input.type === "checkbox") {
        data[input.name] = input.checked;
      } else if (input.name) {
        data[input.name] = input.value;
      }
    });

    data.salario_neto = calcularSalarioNeto();

    if (indexEditar !== null) {
      empleados[indexEditar] = data;
      localStorage.removeItem('editIndex');
    } else {
      empleados.push(data);
    }

    localStorage.setItem('empleados', JSON.stringify(empleados));
    window.location.href = 'lista_empleados.html';
  });
});
