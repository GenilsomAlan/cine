document.addEventListener("DOMContentLoaded", function() {

    const movieListContainer = document.querySelector('.listMovies');
    movieListContainer.innerHTML = `
        <ul class="list"></ul>
    `;

    const movies = [
        { title: "X-Men Apocalipse", linkIncorporated: '<iframe src="https://archive.org/embed/x-men-apocalipse-2016-dublado-5.1-ch-1080p-by-luan-harper-www.thepiratefilmes.com" width="560" height="384" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>'},
        { title: "O Saci (1953)", linkIncorporated: '<iframe src="https://archive.org/embed/o-saci-1953" width="560" height="384" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen></iframe>'}
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