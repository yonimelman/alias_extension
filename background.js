var aliases = {
"dana": "https://www.google.co.il/search?q=yoni+melman&gws_rd=cr,ssl&ei=hLJ2WOO_GpvhwAL0m7aoBw#q=dana+stolowicz",
"dana2": "https://www.google.co.il/search?q=yoni+melman&gws_rd=cr,ssl&ei=hLJ2WOO_GpvhwAL0m7aoBw"
};

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('in input change');
    updateDefaultSuggestion(text, suggest);
  });

chrome.omnibox.onInputStarted.addListener(function() {
  updateDefaultSuggestion('');
});


// function updateDefaultSuggestion(text) {
//     if (text != ''){
//         for (var key in aliases){
//             console.log("key: " + key);
//             if (key.startsWith(text)){
//                 console.log("in update suggestion");
//                 chrome.omnibox.setDefaultSuggestion({
//                 description: key,
//               });
//                 return;
//             };
//         };
//     };
// };


function updateDefaultSuggestion(text, suggest) {
    if (text != ''){
        var suggestions = []
        for (var key in aliases){
            console.log("key: " + key);
            if (key.startsWith(text)){
                suggestions.push({content: key, description: aliases[key]});
                console.log("in update suggestion");
              };
            };
        suggest(suggestions);
        };
    };




// chrome.omnibox.onInputCancelled.addListener(function() {
//   resetDefaultSuggestion();
// });

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
};


chrome.omnibox.onInputEntered.addListener(
  function(text) {
    if (text in aliases)
      navigate(aliases[text]);
});
