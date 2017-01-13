var aliases = {
    "google": "https://www.google.co.il/",
    "ynet": "https://www.ynet.co.il/",
    "a-ynet": "http://www.haaretz.co.il"
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
        chrome.omnibox.setDefaultSuggestion(
            {description: '<match>Alias</match>: Enter an alias'}
        );
        var match = '';
        var url = '';
        var suggestions = [];
        for (var key in aliases){
            url = "<url>" + varifyUrl(aliases[key]) + "</url>";
            console.log("key: " + key + " text: " + text);
            if (key == text){
                console.log("key matched text");
                chrome.omnibox.setDefaultSuggestion(
                    {description: url}
                );
                return;
            };
            if (key.includes(text)){
                match = key.replace(text, "<match>"+text+"</match>");

                // var description = "<match>" + text "</match">
                suggestions.push({
                    content: key,
                    description: match + ": " + url
                });
              };
            };
        console.log("presenting " + suggestions.length + " suggestions");
        suggest(suggestions);
        };
    };

function varifyUrl(url){
    var fixed_url = url
    fixed_url = fixed_url.replace('"', "&quot;")
    fixed_url = fixed_url.replace("'", "&apos;")
    fixed_url = fixed_url.replace('<', "&lt;")
    fixed_url = fixed_url.replace('>', "&gt;")
    fixed_url = fixed_url.replace('&', "&amp;")
    return fixed_url
}


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
