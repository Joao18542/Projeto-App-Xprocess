// Dados dos produtos com imagens
const products = [
    {
        id: 1,
        name: "Camiseta Premium",
        price: 89.90,
        colors: ["Branco", "Preto", "Azul", "Verde"],
        stock: 45,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        name: "Calça Jeans Slim",
        price: 159.90,
        colors: ["Azul Escuro", "Azul Claro", "Preto"],
        stock: 32,
        viewed: true,
        added: true,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        name: "Tênis Esportivo",
        price: 299.90,
        colors: ["Branco", "Preto", "Vermelho", "Azul"],
        stock: 28,
        viewed: true,
        added: true,
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 4,
        name: "Relógio Digital",
        price: 199.90,
        colors: ["Preto", "Azul", "Verde"],
        stock: 15,
        viewed: true,
        added: true,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 5,
        name: "Mochila Executiva",
        price: 249.90,
        colors: ["Preto", "Marrom", "Cinza"],
        stock: 18,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 6,
        name: "Óculos de Sol",
        price: 179.90,
        colors: ["Preto", "Dourado", "Prata"],
        stock: 22,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 7,
        name: "Fone Bluetooth",
        price: 349.90,
        colors: ["Preto", "Branco", "Azul"],
        stock: 12,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 8,
        name: "Perfume Masculino",
        price: 289.90,
        colors: ["Transparente"],
        stock: 8,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 9,
        name: "Smartwatch",
        price: 599.90,
        colors: ["Preto", "Prata", "Rosa"],
        stock: 14,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 10,
        name: "Câmera Digital",
        price: 1299.90,
        colors: ["Preto", "Prata"],
        stock: 5,
        viewed: false,
        added: false,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
];

// Elementos DOM
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const catalogScreen = document.getElementById('catalogScreen');
const productsGrid = document.getElementById('productsGrid');
const searchBar = document.querySelector('.search-bar');

// Carregar produtos no catálogo
function loadProducts(productsToLoad) {
    productsGrid.innerHTML = '';
    
    productsToLoad.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h2>${product.name}</h2>
                <h3>R$ ${product.price.toFixed(2)}</h3>
                <p>Cores disponíveis: ${product.colors.join(', ')}</p>
                <p>Estoque: ${product.stock} unidades</p>
                <div class="product-actions">
                    <button class="action-btn view-btn ${product.viewed ? 'active' : ''}" 
                            data-id="${product.id}" 
                            data-action="view">
                        ${product.viewed ? '✔ Visualizado' : 'Ver'}
                    </button>
                    <button class="action-btn add-btn ${product.added ? 'active' : ''}" 
                            data-id="${product.id}" 
                            data-action="add">
                        ${product.added ? '✔ Adicionado' : 'Adicionar'}
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const action = this.getAttribute('data-action');
            
            const product = products.find(p => p.id === productId);
            
            if (action === 'view') {
                product.viewed = !product.viewed;
                this.textContent = product.viewed ? '✔ Visualizado' : 'Ver';
                this.classList.toggle('active', product.viewed);
            } else if (action === 'add') {
                product.added = !product.added;
                this.textContent = product.added ? '✔ Adicionado' : 'Adicionar';
                this.classList.toggle('active', product.added);
                
                // Feedback visual
                if (product.added) {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 200);
                }
            }
        });
    });
}

// Filtro de pesquisa
searchBar.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    loadProducts(filteredProducts);
});

// Login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validação simples (usuário demo)
    if ((email === 'admin@example.com' && password === 'admin123') || 
        (email && password)) {
        // Efeito de transição
        loginScreen.style.opacity = '0';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            catalogScreen.style.display = 'block';
            setTimeout(() => {
                catalogScreen.style.opacity = '1';
            }, 50);
        }, 300);
        
        // Carregar produtos
        loadProducts(products);
    } else {
        alert('Credenciais inválidas. Use o login demo ou insira um email e senha.');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que apenas a tela de login seja visível inicialmente
    loginScreen.style.display = 'flex';
    catalogScreen.style.display = 'none';
});