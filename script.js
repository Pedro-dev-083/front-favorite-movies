////////////////////////////////////////////////////////////////////////////////////////////////
//Funções para manipular a tela
const generateAllRightsText = () => {
    const allRightsField = document.getElementById("all-rights-text");
    const currentYear = () => {
        return new Date().getFullYear();
    };
    allRightsField.textContent = `© ${currentYear()} Pedro Azevedo. All rights reserved.`;
};

const generateAMovieComponent = (obj) => {
    const movieContainer = document.getElementById("movie-container");
    movieContainer.innerHTML += `<div id="${obj.id}" class="movie-component" onclick="searchMovie(${obj.id})"><div class="movie-name"><p>${obj.name}</p></div></div>`;
    const newMovie = document.getElementById(obj.id);
    newMovie.style.backgroundImage = `url('${obj.img}')`;
};

const generateGenreSelect = (obj) => {
    const genreSelect = document.getElementById("movie-genre");
    genreSelect.innerHTML = "";
    obj.forEach(genre => {
        var option = document.createElement('option');
        option.text = genre.nome;
        option.value = genre.nome;
        genreSelect.add(option);
    });
};

const openMovie = (obj) => {
    openModal("movie-modal");
    const modal = document.getElementById("movie-modal");
    let all_genres = obj.genre;
    let genres = "";

    for (let i = 0; i < all_genres.length; i++) {
        genres += all_genres[i];
        if (i != (all_genres.length - 1)) {
            genres += ", ";
        }
    }
    modal.innerHTML = `
        <div class="modal-container">
            <div id="iconExitContainer">
                <a id="iconExit" href='javascript:closeModal("movie-modal")'>X</a>
            </div>            
            <div class="container">
               <div class="movie-modal-container">
                  <div class="info-container">
                    <div class="read-mode">
                        <p>Nome: ${obj.name}</p>
                        <p>Ano: ${obj.year}</p>
                        <p>Gêneros: ${genres}</p>
                        <button onclick="deleteMovie(${obj.id})">Deletar</button>
                        <button class="updateButton" onclick="updateMode()">Atualizar</button>
                    </div>
                    <div class="update-mode">
                        <div>
                            <label for="movie-name-up">Nome:</label>
                            <input name="movie-name-up" id="movie-name-up" />
                        </div>
                        <div>
                            <label for="movie-genre-up">Gênero(s):</label>
                            <select name="movie-genre-up" id="movie-genre-up" multiple></select>
                        </div>
                        <div>
                            <label for="movie-year-up">Ano de lançamento:</label>
                            <input name="movie-year-up" id="movie-year-up" />
                        </div>
                        <div>
                            <label for="movie-image-up">Link de Imagem:</label>
                            <input name="movie-image-up" id="movie-image-up" />
                        </div>
                        <button onclick="readMode()">Voltar</button>
                        <button class="updateButton" onclick="updateMovie(${obj.id})">Atualizar</button>
                    </div>
                  </div>
                  <div class="image-container">
                    <img src="${obj.img}" />                     
                  </div>
               </div>
            </div>
        <div>
    `;
    document.getElementById("movie-name-up").value = obj.name;
    document.getElementById("movie-genre-up").innerHTML = document.getElementById("movie-genre").innerHTML;
    selectGenres(all_genres);
    document.getElementById("movie-year-up").value = obj.year;
    document.getElementById("movie-image-up").value = obj.img;
}

const selectGenres = (genres) => {
    var select = document.getElementById("movie-genre-up");
    if (!select) return;
    for (var i = 0; i < select.options.length; i++) {
        var option = select.options[i];
        option.selected = genres.includes(option.value);
    }
}

const readMode = () => {
   const readMode = document.querySelector(".read-mode");
   const updateMode = document.querySelector(".update-mode");
   readMode.style.display = "block";
   updateMode.style.display = "none";
}

const updateMode = () => {
    const readMode = document.querySelector(".read-mode");
    const updateMode = document.querySelector(".update-mode");
    readMode.style.display = "none";
    updateMode.style.display = "block";
}

const openModal = (id) => {
    const modal = document.getElementById(id);
    modal.style.opacity = 1;
    modal.style.zIndex = 3;
}

const closeModal = (id) => {
    if (id == "movie-modal"){
        readMode();
    }
    const modal = document.getElementById(id);
    modal.style.opacity = 0;
    modal.style.zIndex = -3;
}

////////////////////////////////////////////////////////////////////////////////////////////////
//Funções de API
const createNewMovie = async () => {
    const name = document.getElementById("movie-name").value;
    const genre = document.getElementById("movie-genre");
    const year = document.getElementById("movie-year").value;
    const img = document.getElementById("movie-image").value;
    const formData = new FormData();
    formData.append('name', name);
    Array.from(genre.selectedOptions).forEach(option => {
        formData.append('genre_names', option.value);
    });
    formData.append('year', parseInt(year));
    formData.append('img', img);

    let url = 'http://127.0.0.1:5000/movie';
    await fetch(url, {
        method: 'post',
        body: formData
    })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            alert("Filme criado");
            getList();
            closeModal("create-movie");
            return response.json();
        })
        .catch((error) => {
            showError(error);
        });
};

const updateMovie = async (id) => {
    const name = document.getElementById("movie-name-up").value;
    const genre = document.getElementById("movie-genre-up");
    const year = document.getElementById("movie-year-up").value;
    const img = document.getElementById("movie-image-up").value;
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    Array.from(genre.selectedOptions).forEach(option => {
        formData.append('genre_names', option.value);
    });
    formData.append('year', parseInt(year));
    formData.append('img', img);

    let url = 'http://127.0.0.1:5000/movie';
    await fetch(url, {
        method: 'put',
        body: formData
    })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            alert("Filme Atualizado");
            getList();
            searchMovie(id);
            readMode();
        })
        .catch((error) => {
            showError(error);
        });
};

const deleteMovie = async (id) => {
    if (confirm("Deseja mesmo deletar?")) {
        let url = 'http://127.0.0.1:5000/movie/id';
        const formData = new FormData();
        formData.append('id', id);

        await fetch(url, {
            method: 'DELETE',
            body: formData
        })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }
                alert("Filme deletado");
                closeModal("movie-modal");
                getList();
            })
            .catch((error) => {
                showError(error);
            });
    }
}

const createNewGenre = async () => {
    const genre = document.getElementById("genre-name").value;

    const formData = new FormData();
    formData.append('name', genre);

    let url = 'http://127.0.0.1:5000/genre';
    await fetch(url, {
        method: 'post',
        body: formData
    })
        .then(async (response) => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            alert("Gênero criado");
            getAllGenres();
            closeModal("create-genre");
        })
        .catch((error) => {
            showError(error)
        });
};

const getList = async () => {
    let url = 'http://127.0.0.1:5000/movies';
    await fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("movie-container").innerHTML = ""; //Para limpar o que tiver
            data.forEach(movie => {
                generateAMovieComponent(movie);
            });
        })
        .catch((error) => {
            showError(error);
        });
};

const getAllGenres = async () => {
    let url = 'http://127.0.0.1:5000/genres';
    await fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            generateGenreSelect(data.genres);            
        })
        .catch((error) => {
            showError(error);
        });
};

const searchMovie = async (id) => {
    let url = 'http://127.0.0.1:5000/movie/id';
    const formData = new FormData();
    formData.append('id', id);

    await fetch(url, {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            openMovie(data);
        })
        .catch((error) => {
            showError(error);
        });
}

////////////////////////////////////////////////////////////////////////////////////////////////
//Funções génericas
const showError = (error) => {
    alert("Não foi possível pois ocorreu o seguinte erro: " + error.message);
    console.error(error);
};

////////////////////////////////////////////////////////////////////////////////////////////////
//Funções para rodar após carregar a árvore DOM
document.addEventListener('DOMContentLoaded', function () {
    generateAllRightsText();
    getList();
    getAllGenres();
});