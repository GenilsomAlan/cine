document.addEventListener("DOMContentLoaded", function() {

    const movieListContainer = document.querySelector('.listMovies');
    movieListContainer.innerHTML = `
        <ul class="list"></ul>
    `;

    const movies = [
        { title: "X-Men Apocalipse", linkIncorporated: '<iframe width="100%" min-height="720px" src="https://www.youtube.com/embed/FcTCY_t7l1c?si=ogPpAVq67mvJmWmK&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'},
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
    }

    function clearHtml() {
        movieListContainer.innerHTML = '';
    }
   
    
        
});