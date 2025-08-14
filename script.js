// State Management
        let products = [];
        let cart = [];
        let orders = [];
        let editingProductId = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadData();
            renderProducts();
            updateCartCount();
        });

        // Load data from localStorage
        function loadData() {
            const savedProducts = localStorage.getItem('products');
            const savedCart = localStorage.getItem('cart');
            const savedOrders = localStorage.getItem('orders');

            if (savedProducts) {
                products = JSON.parse(savedProducts);
            } else {
                // Initialize with default products
                products = [
                    {
                        id: 1,
                        name: "Wireless Headphones",
                        price: 99.99,
                        description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
                        image: "https://picsum.photos/seed/headphones/300/200.jpg",
                        stock: 15
                    },
                    {
                        id: 2,
                        name: "Smart Watch",
                        price: 249.99,
                        description: "Advanced fitness tracking smartwatch with heart rate monitor.",
                        image: "https://picsum.photos/seed/smartwatch/300/200.jpg",
                        stock: 20
                    },
                    {
                        id: 3,
                        name: "Laptop Stand",
                        price: 39.99,
                        description: "Ergonomic aluminum laptop stand for better posture.",
                        image: "https://picsum.photos/seed/laptopstand/300/200.jpg",
                        stock: 30
                    },
                    {
                        id: 4,
                        name: "USB-C Hub",
                        price: 49.99,
                        description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.",
                        image: "https://picsum.photos/seed/usbhub/300/200.jpg",
                        stock: 25
                    }
                ];
                saveProducts();
            }

            if (savedCart) {
                cart = JSON.parse(savedCart);
            }

            if (savedOrders) {
                orders = JSON.parse(savedOrders);
            }
        }

        // Save data to localStorage
        function saveProducts() {
            localStorage.setItem('products', JSON.stringify(products));
        }

        function saveCart() {
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        function saveOrders() {
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        // View Management
        function showView(viewName) {
            const views = document.querySelectorAll('.view');
            views.forEach(view => view.classList.remove('active'));

            document.getElementById(viewName + 'View').classList.add('active');

            if (viewName === 'cart') {
                renderCart();
            } else if (viewName === 'admin') {
                renderAdminProducts();
            }
        }

        // Product Rendering
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <p class="product-description">${product.description}</p>
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Cart Management
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product || product.stock === 0) return;

            const existingItem = cart.find(item => item.productId === productId);
            
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    existingItem.quantity++;
                } else {
                    showNotification('Product out of stock!', 'error');
                    return;
                }
            } else {
                cart.push({
                    productId: productId,
                    quantity: 1
                });
            }

            saveCart();
            updateCartCount();
            showNotification('Product added to cart!', 'success');
        }

        function updateCartCount() {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cartCount').textContent = count;
        }

        function renderCart() {
            const cartContent = document.getElementById('cartContent');
            
            if (cart.length === 0) {
                cartContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                    </div>
                `;
                return;
            }

            let cartHTML = '<div class="cart-items">';
            let subtotal = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;

                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;

                cartHTML += `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${product.name}</div>
                            <div class="cart-item-price">$${product.price.toFixed(2)} each</div>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                        <i class="fas fa-trash remove-btn" onclick="removeFromCart(${item.productId})"></i>
                    </div>
                `;
            });

            cartHTML += '</div>';

            const tax = subtotal * 0.08;
            const total = subtotal + tax;

            cartHTML += `
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (8%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn" onclick="showView('checkout')">Proceed to Checkout</button>
                </div>
            `;

            cartContent.innerHTML = cartHTML;
        }

        function updateQuantity(productId, change) {
            const item = cart.find(item => item.productId === productId);
            const product = products.find(p => p.id === productId);
            
            if (!item || !product) return;

            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else if (newQuantity <= product.stock) {
                item.quantity = newQuantity;
                saveCart();
                renderCart();
                updateCartCount();
            } else {
                showNotification('Not enough stock available!', 'error');
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.productId !== productId);
            saveCart();
            renderCart();
            updateCartCount();
            showNotification('Product removed from cart', 'success');
        }

        // Checkout Process
        function processCheckout(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const orderData = {
                id: Date.now(),
                customer: {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                    city: formData.get('city'),
                    zip: formData.get('zip')
                },
                items: cart.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        ...product,
                        quantity: item.quantity
                    };
                }),
                total: calculateTotal(),
                date: new Date().toISOString()
            };

            // Update stock
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    product.stock -= item.quantity;
                }
            });

            orders.push(orderData);
            saveOrders();
            saveProducts();
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();

            // Show confirmation
            showOrderConfirmation(orderData);
        }

        function calculateTotal() {
            let subtotal = 0;
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    subtotal += product.price * item.quantity;
                }
            });
            const tax = subtotal * 0.08;
            return subtotal + tax;
        }

        function showOrderConfirmation(order) {
            const orderDetails = document.getElementById('orderDetails');
            orderDetails.innerHTML = `
                <p><strong>Order #:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Shipping Address:</strong> ${order.customer.address}, ${order.customer.city} ${order.customer.zip}</p>
                <hr style="margin: 1rem 0;">
                <h4>Order Items:</h4>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <hr style="margin: 1rem 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            `;
            
            showView('confirmation');
        }

        // Admin Functions
        function renderAdminProducts() {
            const tbody = document.getElementById('adminProductsTable');
            tbody.innerHTML = '';

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td>${product.name}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function openProductModal(productId = null) {
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');
            const title = document.getElementById('modalTitle');

            form.reset();
            
            if (productId) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    title.textContent = 'Edit Product';
                    form.name.value = product.name;
                    form.price.value = product.price;
                    form.description.value = product.description;
                    form.stock.value = product.stock;
                    form.image.value = product.image;
                    editingProductId = productId;
                }
            } else {
                title.textContent = 'Add Product';
                editingProductId = null;
            }

            modal.classList.add('active');
        }

        function closeProductModal() {
            document.getElementById('productModal').classList.remove('active');
            editingProductId = null;
        }

        function saveProduct(event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            const productData = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                stock: parseInt(formData.get('stock')),
                image: formData.get('image') || `https://picsum.photos/seed/${Date.now()}/300/200.jpg`
            };

            if (editingProductId) {
                const index = products.findIndex(p => p.id === editingProductId);
                if (index !== -1) {
                    products[index] = { ...products[index], ...productData };
                }
            } else {
                productData.id = Date.now();
                products.push(productData);
            }

            saveProducts();
            renderProducts();
            renderAdminProducts();
            closeProductModal();
            showNotification(editingProductId ? 'Product updated!' : 'Product added!', 'success');
        }

        function editProduct(productId) {
            openProductModal(productId);
        }

        function deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id !== productId);
                saveProducts();
                renderProducts();
                renderAdminProducts();
                showNotification('Product deleted!', 'success');
            }
        }

        // Notifications
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('productModal');
            if (event.target === modal) {
                closeProductModal();
            }
        }