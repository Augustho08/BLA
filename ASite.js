const precoBase = 10.00;

function calcularPreco(quantidade) {
    if (quantidade < 1 || quantidade > 16 || isNaN(quantidade)) {
        return "Insira entre 1 e 16";
    }
    return quantidade * precoBase;
}

document.addEventListener("DOMContentLoaded", () => {
    const priceElement = document.getElementById('priceValue');
    const inputQuantidade = document.getElementById('quantidadeInput');
    const buyButton = document.getElementById('buyButton');
    const formContainer = document.getElementById('formContainer');
    const orderForm = document.getElementById("orderForm");
    const paymentContainer = document.getElementById("qrcode-container");

    async function criarPagamento(valor) {
        const response = await fetch("http://127.0.0.1:8000/OFICIAL/Bsite.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ valor })
        });

        const data = await response.json();
        if (data.point_of_interaction) {
            return `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(data.point_of_interaction.transaction_data.qr_code)}`;
        } else {
            console.error("Erro ao criar pagamento:", data);
            return null;
        }
    }

    // Atualizar o preço ao digitar a quantidade
    inputQuantidade.addEventListener("input", () => {
        const quantidade = parseInt(inputQuantidade.value);
        const preco = calcularPreco(quantidade);
        priceElement.textContent = typeof preco === "string" ? preco : `R$ ${preco.toFixed(2)}`;
    });

    // Mostrar o formulário ao clicar em "ADD TO CART"
    buyButton.addEventListener("click", () => {
        formContainer.classList.remove("hidden");
    });


    // Submissão do formulário com confirmação
    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const confirmacao = confirm("Tem certeza que os dados estão corretos?");
        if (confirmacao) {
            const quantidade = parseInt(inputQuantidade.value);
            const precoFinal = calcularPreco(quantidade);

            if (typeof precoFinal !== "string") {
                const qrCodeUrl = await criarPagamento(precoFinal);
                
                document.getElementById("qrcode-container").innerHTML = `
                    <h2>Escaneie o QR Code para pagar</h2>
                    <img src="${qrCodeUrl}" alt="QR Code">
                    <p>Ou copie a chave PIX:</p>
                    <p><strong>SEU_CNPJ_OU_EMAIL</strong></p>
                `;
                paymentContainer.classList.remove("hidden");
            }
        }
    });
});
