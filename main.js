(async function cargarDatos(){
    async function obtenerDatos(url){
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        if (datos.data.movie_count > 0) { //se comprueba que la respuesta contega informacion
      // aquí se acaba
        return datos;
    }
    // si no hay pelis aquí continua
        throw new Error('No se encontró ningun resultado');
    }
  
 /**FUNCIONES PARA EL EVENTO DEL BUSCADOR DE PELIS */
    const $formulario=document.getElementById("buscador");
    const $busquedaOn=document.getElementById("busquedaOn");
    const $kaka=document.getElementById("kaka")
    

    function setAttributes($element, attributes) {
        for (const attribute in attributes) {
        $element.setAttribute(attribute, attributes[attribute]);
        }
    }

    const URL_API ='https://yts.mx/api/v2/'
 

    function plantillaBuscador(pelicula){
        return `
        <div class="close-btn">
            <i class="icon-cancel-circle icons" id="hide-buscador"></i>
        </div>
        <div class="busqueda-img-container">
            <img src="${pelicula.medium_cover_image}" alt="" id="imagen">
        </div>
        <div class="busqueda-description-container">
            <h3 id="">${pelicula.title}</h3>
            <p id="descripcion">${pelicula.description_full}</p>
        </div>
        `
    }
    
    $formulario.addEventListener('submit', async(evento)=>{
        evento.preventDefault();//evista que el navegador se recargue
        $busquedaOn.classList.add('activa')
        $kaka.classList.add('is-active')
        
        const $loader = document.createElement('img')
        setAttributes($loader, {
        src:'imagenes/loader.gif',
        width:50, heigth:50  
        })
        $busquedaOn.append($loader);
        const data =new FormData($formulario)
        try{
            const {
                data:{
                    movies
                } 
            }=await obtenerDatos(`${URL_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
            const HTMLString=plantillaBuscador(movies[0])
            $busquedaOn.innerHTML=HTMLString;
        }catch(error){
            alert(error.message)
            $loader.remove()
            $busquedaOn.classList.remove('activa')
            $kaka.classList.remove('is-active')
        }
        const $hideBuscador=document.getElementById("hide-buscador");
        $hideBuscador.addEventListener('click', hideBuscador);
        function hideBuscador(){
        $busquedaOn.classList.remove('activa')
        $kaka.classList.remove('is-active')
    }   
    })
    

    //*******FUNCIONES PARA LA PARTE PRINCIPAL DEL LA PELICULAS */
    function plantillaPelicula(pelicula, categoria){
        return(
            `<div class="movie-container" data-id="${pelicula.id}" data-categoria=${categoria}>
                <div class="img-movie-container">
                    <img class="img-movie"src="${pelicula.medium_cover_image}" alt="">
                </div>
                <div class="movie-description">
                    <!--<p>${pelicula.title}</p>-->
                </div>
            </div>`
        )   
    }
    function constructorPlantilla(stringHtml){// funcion que crea la base del html 
        const html=document.implementation.createHTMLDocument();//esta funcion de js sirve para crear el html basico
        html.body.innerHTML=stringHtml;//aqui insertamos la platilla de la peli
        return html.body.children[0];
    }
    function addEventoClick($elemento){
        $elemento.addEventListener('click', ()=>{
            showModal($elemento)
        })
    }

    function constructorPorLista(lista, $container, categoria){//esta funcion crea la platilla complata de peliculas por categorias. se le pasa la lista y el contenedor.
        //accionList.data.movies.
        //Se recorreo la lista de peliculas y por cada elemento de se crea la plantilla, se construye y se añade al html.
        lista.forEach(element => {
            const HTMLString=plantillaPelicula(element, categoria);
            const elementoCreado= constructorPlantilla(HTMLString);
            $container.append(elementoCreado);
            const imagen=elementoCreado.querySelector('img');
            imagen.addEventListener('load',(event)=>{
                event.target.classList.add('fadeIn');
            })
            //elementoCreado.classList.add('fadeIn');
            addEventoClick(elementoCreado, element);
        })
    }
   /** Se crea una funcion para saber si hay datos almacenados en la cache y sino se piden a la API */
   
   
   async function datosCache(categoria){
       const listName=`${categoria}List`
       const cacheList=window.localStorage.getItem(listName);
       if(cacheList){
           return JSON.parse(cacheList)
       }
       const {data: {movies: listaPelis}}= await obtenerDatos(`${URL_API}list_movies.json?genre=${categoria}`);
       window.localStorage.setItem(listName, JSON.stringify(listaPelis))
       return listaPelis;
   }
    
    //listas de pelis por genero
    /** creamos las listas por desestructuracion y a continuacion se llama al contructor*/
     //traemos los contenedores de las peliculas por genero
    
    const actionList=await datosCache('action');
    const $containerAction=document.getElementById("action")
    
    constructorPorLista(actionList, $containerAction, 'action');
    
    const terrorList= await datosCache('horror')
    const $containerTerror=document.getElementById("horror")
    constructorPorLista(terrorList, $containerTerror, 'horror');

    const comedyList= await datosCache('comedy')
    const $containerComedy=document.getElementById("comedy")
    constructorPorLista(comedyList, $containerComedy, 'comedy');
    //se llama al constructor para generar el contenido.
   

   const $modal=document.getElementById('modal')
   const $overlay=document.getElementById('overlay')
   const $hideModal=document.getElementById('hide-modal')

    $modalTitulo=$modal.querySelector('h1')
    $modalImagen=$modal.querySelector('img')
    $modalDescription=$modal.querySelector('p')

    function encontarById(lista, id){
       return lista.find(movie=> movie.id===parseInt(id, 10))
    }

    function encontrarPelicula(id,categoria){
        switch(categoria){
            case 'action':{
                return encontarById(actionList,id)
            }
            case 'horror':{
                return encontarById(terrorList,id)
            }
            default:{
                return encontarById(comedyList,id)
            }
        }
    }

    function showModal($elemento){
        $overlay.classList.add('activa');
        $modal.style.animation = 'modalIn .8s forwards';
        const id_peli=$elemento.dataset.id;
        const categoria_peli=$elemento.dataset.categoria;
        const peli_encontrada= encontrarPelicula(id_peli, categoria_peli);
        $modalTitulo.textContent=peli_encontrada.title;
        $modalImagen.setAttribute('src', peli_encontrada.medium_cover_image);
        $modalDescription.textContent=peli_encontrada.description_full;
    }

    $hideModal.addEventListener('click', hideModal);
    function hideModal(){
        $overlay.classList.remove('activa')
        $modal.style.animation='modalOut .8s forwards';
    }
    
    

})()


/**if(overlayActivo){ 
                $titulo.remove();
                overlayActivo=false
                if(!overlayActivo){
                    showOverlay(pelicula, $contenedor)
                    $titulo=document.getElementById(pelicula.id)
                    overlayActivo=true
                }
            }
            else{
                showOverlay(pelicula, $contenedor)
                $titulo=document.getElementById(pelicula.id)
                overlayActivo=true
            }
            //showOverlay(pelicula); */