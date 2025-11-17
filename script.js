/*document.addEventListener("DOMContentLoaded", function() {

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
    }

    function clearHtml() {
        movieListContainer.innerHTML = '';
    }
   
});*/

document.addEventListener("DOMContentLoaded", function() {

    const movieListContainer = document.querySelector('.listMovies');
    // Inicialmente, carregar a lista
    loadMovieList();

    const movies = [
        { title: "X-Men Apocalipse", linkIncorporated: '<iframe width="560" height="315" src="https://www.youtube.com/embed/7FM29A10FmQ?si=A0M1gJV5HvuRGyrD" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'},
        { title: "Movimento de Jesus", linkIncorporated: ''}
    ];

    /**
     * Função para carregar e exibir a lista de filmes.
     */
    function loadMovieList() {
        movieListContainer.innerHTML = `
            <ul class="list"></ul>
        `;
        const lista = document.querySelector('.list');

        for(let i = 0; i < movies.length; i++) {
            lista.innerHTML += `<li data-index="${i}">${movies[i].title}</li>`;
        }

        lista.addEventListener('click', executarMovie);
    }

    /**
     * Função executada ao clicar em um item da lista.
     * Exibe o vídeo e o botão de voltar.
     */
    function executarMovie(event) {
        const li = event.target.closest('li');
        if (!li) return;

        const index = li.dataset.index;
        console.log('índice clicado:', index); 

        // 1. Limpa o container
        clearHtml();

        const content = movies[index].linkIncorporated;
        
        if (content) {
            // 2. Cria o container do player e botão
            movieListContainer.innerHTML = `
                <div class="player-container">
                    <button class="back-button">← Voltar à Lista</button>
                    <div class="video-player">
                        ${content}
                    </div>
                </div>
            `;
            
            // 3. Adiciona o listener ao novo botão de voltar
            const backButton = document.querySelector('.back-button');
            backButton.addEventListener('click', handleBackToList);

        } else {
            movieListContainer.innerHTML = '<p>Sem link disponível para este filme.</p>';
            // Adiciona um botão de voltar mesmo sem vídeo
            movieListContainer.innerHTML += '<button class="back-button empty">← Voltar à Lista</button>';
            const backButton = document.querySelector('.back-button');
            backButton.addEventListener('click', handleBackToList);
        }
    }

    /**
     * Função para limpar o container de filmes.
     */
    function clearHtml() {
        movieListContainer.innerHTML = '';
    }

    /**
     * Função para retornar à visualização da lista.
     */
    function handleBackToList() {
        clearHtml();
        loadMovieList();
    }
    
});