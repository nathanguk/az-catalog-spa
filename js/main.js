// Select DOM elements to work with
const container = document.getElementById('container');
const modalbody = document.getElementById('modal-body');
const modalLabel = document.getElementById('modalLabel');
const form = document.getElementById('form');

// Azure Function App Uri
const uri = "https://<<YOUR FUNCTION APP>>-fa.azurewebsites.net/api/";
// Azure Function App Host Key
const code = "<<YOUR FUNCTION APP HOST KEY>";


// Javascript Load Template List
getTemplates().then(options => {

   const chunk = (arr, size) =>
   Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
   );

   let decksArray = chunk(options, 3);

   for(let deckArray of decksArray){

      if(deckArray.length < 3){
         while(deckArray.length < 3){
            deckArray.push({
               name: "Coming Soon..."
            });
         } 
      }

      let cardDeckDiv = document.createElement('div');
      cardDeckDiv.classList.add('card-deck');
      cardDeckDiv.classList.add('mb-3'); 
      cardDeckDiv.classList.add('text-left');  

      for(let card of deckArray){
         let cardDiv = document.createElement('div');
         cardDiv.classList.add('card');
         cardDiv.classList.add('mb-3'); 
         cardDiv.classList.add('box-shadow'); 
         cardDiv.classList.add('bg-light');
         cardDiv.classList.add('border-secondary');

         let cardDivHeader = document.createElement('div');
         cardDivHeader.classList.add('card-header');
         let cardHeaderElement = document.createElement("h5")
         let cardHeaderText = document.createTextNode(templateLabel(card.name));
         cardHeaderElement.appendChild(cardHeaderText); 
         cardDivHeader.appendChild(cardHeaderElement);

         let cardDivBody = document.createElement('div');
         cardDivBody.classList.add('card-body');
         let cardBodyElement = document.createElement('p');
         cardBodyElement.classList.add('card-text');
         cardBodyElement.innerHTML = `This template deploys: <em>${templateBody(card.name)}</em>`;
         cardDivBody.appendChild(cardBodyElement);

         let cardDivFooter = document.createElement('div');
         cardDivFooter.classList.add('card-footer');

         let cardDivFooterRow = document.createElement('div');
         cardDivFooterRow.classList.add('row');

         console.log(JSON.stringify(card.visualize));

         let cardDivFooterBtnV = document.createElement('div');
         cardDivFooterBtnV.classList.add('col-sm-3');
         //cardDivFooterBtnV.classList.add('text-right');
         let cardFooterBtnV = document.createElement("button");
         cardFooterBtnV.classList.add('btn');
         cardFooterBtnV.classList.add('btn-sm');
         cardFooterBtnV.classList.add('btn-purple');
         cardFooterBtnV.innerHTML = 'Visualize';
         cardFooterBtnV.id = `${card.name}-v`;
         cardFooterBtnV.addEventListener('click', async function(event) {
            cardFooterBtnV.disabled = true;
            window.open(card.visualize);
            cardFooterBtnV.disabled = false;
         });
         if(card.name == 'Coming Soon...'){
            cardFooterBtnV.disabled = true;
         }
         cardDivFooterBtnV.appendChild(cardFooterBtnV);

         let cardDivFooterBtn = document.createElement('div');
         cardDivFooterBtn.classList.add('col-sm-3');
         //cardDivFooterBtn.classList.add('text-right');
         let cardFooterBtn = document.createElement("button");
         cardFooterBtn.classList.add('btn');
         cardFooterBtn.classList.add('btn-sm');
         cardFooterBtn.classList.add('btn-purple');
         cardFooterBtn.innerHTML = 'Deploy';
         cardFooterBtn.id = card.name;
         cardFooterBtn.addEventListener('click', async function(event) {
            cardFooterBtn.disabled = true;
            await createForm(event.target.id);
            cardFooterBtn.disabled = false;
         });
         if(card.name == 'Coming Soon...'){
            cardFooterBtn.disabled = true;
         }
         cardDivFooterBtn.appendChild(cardFooterBtn);

         let cardDivFooterImg = document.createElement('div');
         cardDivFooterImg.classList.add('col-sm-6');
         cardDivFooterImg.classList.add('text-left');
         cardFooterImg = document.createElement("img"); //
         cardFooterImg.src = './assets/img/azure.svg'; //
         cardFooterImg.classList.add('img-card'); // img-fluid
         cardDivFooterImg.appendChild(cardFooterImg);

         
         cardDivFooterRow.appendChild(cardDivFooterImg);
         cardDivFooterRow.appendChild(cardDivFooterBtnV);
         cardDivFooterRow.appendChild(cardDivFooterBtn);
         cardDivFooter.appendChild(cardDivFooterRow);

         cardDiv.appendChild(cardDivHeader);
         cardDiv.appendChild(cardDivBody);
         cardDiv.appendChild(cardDivFooter);

         cardDeckDiv.appendChild(cardDiv);

      };

      container.appendChild(cardDeckDiv);

   };

});

// JavaScript to handle convert form to JSON and submit to Azure function
async function deployTemplate(event, template) {

   event.preventDefault();
   const data = new FormData(event.target);

   const body = {
      template: template,
      parameters: Object.fromEntries(data.entries())
   }

   console.log(JSON.stringify(body));

   const url = `${uri}deployTemplate?code=${code}`

   const options = {
      method: 'POST',
      mode: 'cors',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json'
      },
      body: JSON.stringify(body)
   }

   try {
      const response = await fetch(url, options);
      const content = await response.json();

      // Redirect to Azure Portal Template Url
      window.location.href = content.location;

   } catch (err) {
      console.log(err);

   };

};

// JavaScript to load Array of Template names
async function getTemplates() {

    const url = `${uri}getTemplates?code=${code}`

    const options = {
       method: 'GET',
       mode: 'cors',
       headers: {
          'Accept': 'application/json'
       }
    }

    try {
       const response = await fetch(url, options);
       const content = await response.json();

       return content

    } catch (err) {
       console.log(err);

    };
 };

 // JavaScript to get Template parameters
 async function getTemplate(name) {
    const url = `${uri}getTemplate?code=${code}&template=${name}`

    const options = {
       method: 'GET',
       mode: 'cors',
       headers: {
          'Accept': 'application/json'
       }
    }

    try {
       const response = await fetch(url, options);
       const content = await response.json();

       return content

    } catch (err) {
       console.log(err);

    };
 };

 // JavaScript to create Dynamic Html form
 async function createForm(template) {

    // Clear Form Inputs
    while (form.hasChildNodes()) {
       form.removeChild(form.lastChild);
    }

    let templateJson = await getTemplate(template);
    let parameterNames = Object.keys(templateJson);
    let br = document.createElement("br");

    parameterNames.forEach(parameterName => {

       // Create Form Label
       let formRow = document.createElement("div");
       formRow.classList.add('row');
       formRow.classList.add('form-group');

       let formLabel = document.createElement("label");
       formLabel.classList.add('col-sm-4');
       formLabel.classList.add('col-form-label');
       formLabel.classList.add('col-form-label-sm');
       formLabel.setAttribute("type", "text");
       formLabel.setAttribute("value", parameterName);

       formLabel.innerText = humanLabel(parameterName);
       formRow.appendChild(formLabel);

       let formRowCol = document.createElement("div");
       formRowCol.classList.add('col-sm-8');

       if (templateJson[parameterName].allowedValues) {
          //Build Select Input
          let formSelect = document.createElement("select");
          formSelect.classList.add('form-control');
          formSelect.classList.add('form-control-sm');
          formSelect.setAttribute("name", parameterName);

          let options = templateJson[parameterName].allowedValues;

          options.forEach(option => {
                let defaultOption = false;

                if(option == templateJson[parameterName].defaultValue){
                   defaultOption = true
                }

                formSelect.options.add(
                   new Option(option, option, defaultOption, defaultOption)
                )
             }
          );

          formRowCol.appendChild(formSelect);

       } else {
          //Build Form Input
          let formInput = document.createElement("input");
          formInput.classList.add('form-control');
          formInput.classList.add('form-control-sm');
          formInput.required = true;

          if(templateJson[parameterName].metadata && templateJson[parameterName].metadata.description){
            formInput.setAttribute("data-toggle", "tooltip");
            formInput.setAttribute("data-placement", "top");
            formInput.setAttribute("title", templateJson[parameterName].metadata.description);
          };

          if (templateJson[parameterName].type.toLowerCase() == "int") {
             formInput.setAttribute("type", "number");
             if(templateJson[parameterName].minValue){
               formInput.min = templateJson[parameterName].minValue
            };
            if(templateJson[parameterName].maxValue){
               formInput.max = templateJson[parameterName].maxValue
            };
          }else if(templateJson[parameterName].type.toLowerCase() == "securestring"){
            formInput.setAttribute("type", "password");
            if(templateJson[parameterName].minLength){
               formInput.minLength = templateJson[parameterName].minLength
            };
            if(templateJson[parameterName].maxLength){
               formInput.maxLength = templateJson[parameterName].maxLength
            };
          }else {
            formInput.setAttribute("type", "text");
            if(templateJson[parameterName].minLength){
               formInput.minLength = templateJson[parameterName].minLength
            };
            if(templateJson[parameterName].maxLength){
               formInput.maxLength = templateJson[parameterName].maxLength
            };
         };

          formInput.setAttribute("name", parameterName);

          if (templateJson[parameterName].defaultValue) {
             formInput.setAttribute("value", `${templateJson[parameterName].defaultValue}`);
          }

          formRowCol.appendChild(formInput);
       };

       formRow.appendChild(formRowCol);
       form.appendChild(formRow);
       form.addEventListener('submit', (event) => deployTemplate(event, template));

    });

    // add Button to Form
    let formRow = document.createElement("div");
    formRow.classList.add('text-right');

    let formButton = document.createElement("input");
    formButton.setAttribute("type", "submit");
    formButton.id = 'deploy';
    formButton.classList.add('btn');
    formButton.classList.add('btn-purple');
    formButton.setAttribute("value", "Deploy");
    formRow.appendChild(formButton);
    form.appendChild(formRow);

    modalLabel.innerHTML = (templateLabel(template));  
    modalbody.appendChild(form); 
    $("#modal").modal('show');
 
 };

// Pretty Format Labels
function humanLabel(inputString){
   return (inputString.charAt(0).toUpperCase() + inputString.slice(1)).split(/(?=[A-Z])/).join(' ')
};

// Pretty Format Templates
function templateLabel(inputString){
   const words = inputString.split('-');

   for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
   };

   let outputString = words.join(' ');

   if(outputString.length > 30){
      outputString = `${outputString.substring(0,27)}...`;
   };

   return outputString
};

function templateBody(inputString){
   return inputString.split('-').join(' ');
};

// Enable Tool Tips
$(document).ready(function() {
   $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});








