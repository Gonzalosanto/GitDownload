require('dotenv').config({ path: __dirname + '/.env' })
const config = require('./envVars');
const fetch = require('node-fetch');
const fs= require('fs')
const path = require('path');
 
// ESCRIBE EL ARCHIVO EN LA RUTA CON EL NOMBRE Y FORMATO LA DATA QUE SE DESCARGA DEL GITHUB 
function saveJsonFile(data, route, filename){
  return new Promise( (resolve, reject)=>{
      try {
        if(!fs.existsSync(route)){
            fs.mkdirSync(route, {recursive: true}, (err) => {
               if (err) throw err;          
              });
            fs.writeFileSync(route+'/'+filename, data, function(err) {
            if(err) {
                reject(err);
            }
            resolve('ok');
            console.log("Archivo descargado en la carpeta nueva");
            });  
              
        }else {
            console.log('La carpeta ya existe en la ruta seleccionada');
            fs.writeFile(route+'/'+filename, data, function(err) {
              if(err) {
                reject(err);
              }
              resolve('ok');
              console.log("Archivo descargado en la carpeta existente");
            }); 
        }
          
      } catch (error) {
          reject(error);
      }
  });
}

// TODO: Configurar para recibir una carpeta con archivos e iterar sobre los archivos
function getFileFromGithub(owner, repository, file){
  return new Promise( (resolve, reject)=>{   
    const apiUrl = "https://api.github.com";
    let endpoint= "/repos/"+owner+"/"+repository+"/contents/"+file;

    fetch(apiUrl + endpoint, {method:'GET', headers: {'Accept':'application/vnd.github.v3+json', 'Authorization' : 'Bearer ' + config.OAuthToken }})
    .then(response => response.json())
    .then((json)=>{
      for (const i in json) {
        console.log(json[i]);
        fetch(json[i]['download_url'])
        .then(res=>res.text())
        .then((data)=>{        
          saveJsonFile(data, json[i]['path'], json[i]['name']);
          resolve(data);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
      }  
    })
    .catch((err)=>{
      console.log(err);
      reject(err);
    });    
  });
}

module.exports = {saveJsonFile, getFileFromGithub}