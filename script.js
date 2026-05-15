const cepInput = document.getElementById("cep");
const form = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const tabButtons = document.querySelectorAll(".tab-button");
const perfilSelect = document.getElementById("perfil");

const fields = {
  logradouro: document.getElementById("logradouro"),
  bairro: document.getElementById("bairro"),
  cidade: document.getElementById("cidade"),
  uf: document.getElementById("uf")
};

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatCEP(value) {
  const numbers = onlyNumbers(value).slice(0, 8);

  if (numbers.length > 5) {
    return numbers.slice(0, 5) + "-" + numbers.slice(5);
  }

  return numbers;
}

function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.classList.toggle("error", isError);
  formMessage.style.display = "block";
}

function clearAddress() {
  fields.logradouro.value = "";
  fields.bairro.value = "";
  fields.cidade.value = "";
  fields.uf.value = "";
}

async function searchCEP(cep) {
  const cleanCEP = onlyNumbers(cep);

  if (cleanCEP.length !== 8) {
    clearAddress();
    showMessage("Digite um CEP com 8 números para buscar o endereço automaticamente.", true);
    return;
  }

  showMessage("Consultando CEP na API ViaCEP...");

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      clearAddress();
      showMessage("CEP não encontrado. Confira os números digitados.", true);
      return;
    }

    fields.logradouro.value = data.logradouro || "";
    fields.bairro.value = data.bairro || "";
    fields.cidade.value = data.localidade || "";
    fields.uf.value = data.uf || "";

    showMessage("Endereço preenchido automaticamente com sucesso.");
  } catch (error) {
    clearAddress();
    showMessage("Não foi possível consultar o CEP agora. Tente novamente em instantes.", true);
  }
}

cepInput.addEventListener("input", function () {
  cepInput.value = formatCEP(cepInput.value);
});

cepInput.addEventListener("blur", function () {
  searchCEP(cepInput.value);
});

tabButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    tabButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");
    perfilSelect.value = button.dataset.profile;
  });
});

perfilSelect.addEventListener("change", function () {
  tabButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.profile === perfilSelect.value);
  });
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const structuredData = Object.fromEntries(formData.entries());

  structuredData.dataCadastro = new Date().toISOString();
  structuredData.origem = "Portal Institucional Macacoverso";

  console.log("Cadastro estruturado:", structuredData);

  showMessage("Cadastro enviado com sucesso! Os dados estruturados foram exibidos no console do navegador.");

  form.reset();
  clearAddress();

  tabButtons.forEach(function (item) {
    item.classList.remove("active");
  });

  tabButtons[0].classList.add("active");
  perfilSelect.value = "Doador";
});