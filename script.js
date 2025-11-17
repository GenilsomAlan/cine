document.addEventListener("DOMContentLoaded", function() {

    const movieListContainer = document.querySelector('.listMovies');
    movieListContainer.innerHTML = `
        <ul class="list"></ul>
    `;

    const movies = [
        { title: "X-Men Apocalipse", linkIncorporated: '<iframe width="560" height="315" src="https://www.youtube.com/embed/7FM29A10FmQ?si=A0M1gJV5HvuRGyrD" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'},
        { title: "Movimento de Jesus", linkIncorporated: ''}
    ];

    const lista = document.querySelector('.list');

    for(let i = 0; i < movies.length; i++) {
        lista.innerHTML += `<li data-index="${i}">${movies[i].title}</li>`;
        console.log(movies[i].title);
    }

    lista.addEventListener('click', executarMovie);
    
    function executarMovie(event) {
        const li = event.target.closest('li');
        if (!li) return;

        // ler o índice do data-attribute
        const index = li.dataset.index;
        console.log('índice clicado:', index); // índice como string

        clearHtml();
        movieListContainer.innerHTML = movies[index].linkIncorporated || 'Sem link disponível';

        Object.assign(movieListContainer.computedStyleMap,{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '9999',
            background: '#000'
        });

        const el = movieListContainer;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(()=>{/* usuário pode negar */});
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }

    }

    function clearHtml() {
        movieListContainer.innerHTML = '';
    }
   
    
        
});