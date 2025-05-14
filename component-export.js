/**
 * Component Export Script for React Static Site
 * 
 * This script exports all the React components needed for the static site
 * to render exactly like the dynamic site.
 */

(function() {
  // Main React Components
  window.__STATIC_COMPONENTS = {
    // Navbar Component
    Navbar: function Navbar(props) {
      return React.createElement('nav', { 
        className: 'bg-stone-800 text-white py-4 shadow-md' 
      }, 
        React.createElement('div', { 
          className: 'container mx-auto flex justify-between items-center'
        }, [
          React.createElement('a', { 
            href: '/', 
            className: 'text-2xl font-bold text-amber-400'
          }, 'Sweet Moment Chocolates'),
          React.createElement('div', { 
            className: 'flex space-x-6'
          }, [
            React.createElement('a', { href: '/', className: 'hover:text-amber-300' }, 'Home'),
            React.createElement('a', { href: '/menu', className: 'hover:text-amber-300' }, 'Menu'),
            React.createElement('a', { href: '/about', className: 'hover:text-amber-300' }, 'About'),
            React.createElement('a', { href: '/contact', className: 'hover:text-amber-300' }, 'Contact')
          ])
        ])
      );
    },
    
    // Footer Component
    Footer: function Footer(props) {
      return React.createElement('footer', { 
        className: 'bg-stone-800 text-white py-8 mt-auto'
      }, 
        React.createElement('div', { 
          className: 'container mx-auto flex flex-col md:flex-row justify-between'
        }, [
          React.createElement('div', { className: 'mb-6 md:mb-0' }, [
            React.createElement('h3', { className: 'text-xl font-bold mb-3' }, 'Sweet Moment Chocolates'),
            React.createElement('p', { className: 'text-gray-300' }, 'Premium handcrafted chocolates for every occasion.')
          ]),
          React.createElement('div', { className: 'mb-6 md:mb-0' }, [
            React.createElement('h4', { className: 'text-lg font-semibold mb-3' }, 'Quick Links'),
            React.createElement('ul', { className: 'space-y-2' }, [
              React.createElement('li', {}, React.createElement('a', { href: '/', className: 'hover:text-amber-300' }, 'Home')),
              React.createElement('li', {}, React.createElement('a', { href: '/menu', className: 'hover:text-amber-300' }, 'Menu')),
              React.createElement('li', {}, React.createElement('a', { href: '/about', className: 'hover:text-amber-300' }, 'About Us')),
              React.createElement('li', {}, React.createElement('a', { href: '/contact', className: 'hover:text-amber-300' }, 'Contact'))
            ])
          ]),
          React.createElement('div', { className: 'mb-6 md:mb-0' }, [
            React.createElement('h4', { className: 'text-lg font-semibold mb-3' }, 'Contact Us'),
            React.createElement('p', { className: 'text-gray-300' }, 'Discovery Square'),
            React.createElement('p', { className: 'text-gray-300' }, 'Herndon, VA'),
            React.createElement('p', { className: 'text-gray-300 mt-2' }, '© ' + new Date().getFullYear() + ' Sweet Moment Chocolates')
          ])
        ])
      );
    },
    
    // ProductCard Component
    ProductCard: function ProductCard(props) {
      const { product } = props;
      
      return React.createElement('div', { 
        className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',
        'data-product-id': product.id
      }, [
        React.createElement('img', { 
          src: product.image || 'https://placehold.co/400x300?text=Sweet+Moment', 
          alt: product.name,
          className: 'w-full h-48 object-cover'
        }),
        React.createElement('div', { className: 'p-4' }, [
          React.createElement('h3', { className: 'text-xl font-semibold text-stone-800' }, product.name),
          React.createElement('p', { className: 'text-stone-600 mt-1' }, product.description),
          React.createElement('div', { className: 'mt-4 flex justify-between items-center' }, [
            React.createElement('span', { className: 'text-lg font-bold text-amber-600' }, 
              '$' + (product.price || (product.basePrice / 100).toFixed(2))
            ),
            React.createElement('span', { className: 'text-xs text-stone-500' }, 
              product.size ? `Size: ${product.size}` : ''
            )
          ])
        ])
      ]);
    },
    
    // HeroSection Component
    HeroSection: function HeroSection(props) {
      const heroSection = window.STATIC_DATA?.siteCustomization?.heroSection 
        ? JSON.parse(window.STATIC_DATA.siteCustomization.heroSection)
        : {
            title: "Experience Life's Sweetest Moments",
            subtitle: "Curated treats and heartfelt gifts that brighten every day",
            buttonText: "Discover Your Moment",
            buttonLink: "/menu"
          };
      
      return React.createElement('section', { 
        className: 'bg-amber-50 py-16',
        style: { 
          backgroundImage: heroSection.imageUrl ? `url(${heroSection.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      }, 
        React.createElement('div', { 
          className: 'container mx-auto text-center px-4 py-16 bg-black bg-opacity-40 rounded-lg text-white'
        }, [
          React.createElement('h1', { 
            className: 'text-4xl md:text-5xl font-bold mb-4'
          }, heroSection.title),
          React.createElement('p', { 
            className: 'text-xl md:text-2xl mb-8 max-w-3xl mx-auto'
          }, heroSection.subtitle),
          React.createElement('a', { 
            href: heroSection.buttonLink || '/menu',
            className: 'bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors'
          }, heroSection.buttonText || 'View Menu')
        ])
      );
    },
    
    // Menu Component
    Menu: function Menu(props) {
      const products = window.STATIC_DATA?.products || [];
      
      return React.createElement('section', { className: 'py-12' }, 
        React.createElement('div', { className: 'container mx-auto px-4' }, [
          React.createElement('h2', { 
            className: 'text-3xl font-bold text-center mb-12 text-stone-800'
          }, 'Our Products'),
          React.createElement('div', { 
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
          }, products.map(product => 
            React.createElement(window.__STATIC_COMPONENTS.ProductCard, { 
              key: product.id, 
              product: product 
            })
          ))
        ])
      );
    },
    
    // Main App Component
    App: function App(props) {
      return React.createElement('div', { className: 'flex flex-col min-h-screen' }, [
        React.createElement(window.__STATIC_COMPONENTS.Navbar, {}),
        React.createElement('main', {}, [
          window.location.pathname === '/' || window.location.pathname === '/index.html'
            ? [
                React.createElement(window.__STATIC_COMPONENTS.HeroSection, {}),
                React.createElement(window.__STATIC_COMPONENTS.Menu, {})
              ]
            : window.location.pathname === '/menu' || window.location.pathname === '/menu.html'
              ? React.createElement(window.__STATIC_COMPONENTS.Menu, {})
              : React.createElement('div', { className: 'container mx-auto px-4 py-12' }, [
                  React.createElement('h1', { className: 'text-3xl font-bold mb-6' }, 'Page Not Found'),
                  React.createElement('p', {}, 'Sorry, the page you are looking for does not exist.')
                ])
        ]),
        React.createElement(window.__STATIC_COMPONENTS.Footer, {})
      ]);
    }
  };
  
  // Mount the app when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for any other initialization to complete
    setTimeout(() => {
      const root = document.getElementById('root');
      if (root && (!root.children.length || root.children.length < 3)) {
        console.log('Mounting static React components...');
        
        if (typeof ReactDOM !== 'undefined') {
          ReactDOM.render(
            React.createElement(window.__STATIC_COMPONENTS.App, {}),
            root
          );
        } else {
          console.error('ReactDOM not found, cannot mount components');
          
          // Fallback to direct DOM manipulation
          root.innerHTML = `
            <nav class="bg-stone-800 text-white py-4 shadow-md">
              <div class="container mx-auto px-4 flex justify-between items-center">
                <a href="/" class="text-2xl font-bold text-amber-400">Sweet Moment Chocolates</a>
                <div class="flex space-x-6">
                  <a href="/" class="hover:text-amber-300">Home</a>
                  <a href="/menu" class="hover:text-amber-300">Menu</a>
                  <a href="/about" class="hover:text-amber-300">About</a>
                  <a href="/contact" class="hover:text-amber-300">Contact</a>
                </div>
              </div>
            </nav>
            <main>
              <div class="container mx-auto px-4 py-12">
                <h1 class="text-3xl font-bold mb-6">Our Products</h1>
                <div id="product-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
              </div>
            </main>
            <footer class="bg-stone-800 text-white py-8 mt-auto">
              <div class="container mx-auto px-4">
                <p class="text-center">© ${new Date().getFullYear()} Sweet Moment Chocolates</p>
              </div>
            </footer>
          `;
          
          // Populate products
          if (window.STATIC_DATA && window.STATIC_DATA.products) {
            const productContainer = document.getElementById('product-container');
            window.STATIC_DATA.products.forEach(product => {
              const productCard = document.createElement('div');
              productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
              productCard.setAttribute('data-product-id', product.id);
              
              productCard.innerHTML = `
                <img src="${product.image || 'https://placehold.co/400x300?text=Sweet+Moment'}" 
                     alt="${product.name}" class="w-full h-48 object-cover">
                <div class="p-4">
                  <h3 class="text-xl font-semibold text-stone-800">${product.name}</h3>
                  <p class="text-stone-600 mt-1">${product.description}</p>
                  <div class="mt-4 flex justify-between items-center">
                    <span class="text-lg font-bold text-amber-600">$${(product.price || (product.basePrice / 100)).toFixed(2)}</span>
                    ${product.size ? `<span class="text-xs text-stone-500">Size: ${product.size}</span>` : ''}
                  </div>
                </div>
              `;
              
              productContainer.appendChild(productCard);
            });
          }
        }
      }
    }, 800);
  });
})();