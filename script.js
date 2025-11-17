document.addEventListener("DOMContentLoaded", function() {

    const movieListContainer = document.querySelector('.listMovies');
    movieListContainer.innerHTML = `
        <ul class="list"></ul>
    `;

    const movies = [
        { title: "X-Men Apocalipse", linkIncorporated: '<iframe src="https://drive.google.com/file/d/1CsQMcgZ_seDelgFAtz5bwwvLm5q8Hfoh/preview" width="640" height="480" allow="autoplay"></iframe>'},
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