var aliases;
var current_url;
var commands = {
    '#remove': 'Remove an existing alias',
    '#add'   : 'Add the current page as an alias',
    '#show'  : 'Show all aliases',
    '#purge' : 'Remove all aliases'
};

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('in input change');
    updateSuggestions(text, suggest);
  });

chrome.omnibox.onInputStarted.addListener(
    function(){
    loadAliases();
    setCurrentUrl();
    chrome.omnibox.setDefaultSuggestion(
        {description: '<match>Alias</match>: Enter an alias'}
    );
});

chrome.omnibox.onInputEntered.addListener(
    function(text) {
        if (text in aliases)
            navigate(aliases[text]);
});


function updateSuggestions(text, suggest) {
    var suggestions = [];
    setBaseDefaultSuggestion();

    if (text.startsWith('#')){
        suggestions = handleCommands(text);
    }
    else if (text !== ''){

        var match = '';
        var url = '';
        for (var key in aliases){
            url = addXMLUrl(varifyXML(aliases[key]));
            console.log("key: " + key + " text: " + text);
            if (key == text){
                console.log("key matched text");
                chrome.omnibox.setDefaultSuggestion(
                    {description: url}
                );
                return;
            }
            if (key.includes(text)){
                match = key.replace(text, addXMLMatch());

                // var description = "<match>" + text "</match">
                suggestions.push({
                    content: key,
                    description: match + ": " + url
                });
              }
            }
        console.log("presenting " + suggestions.length + " suggestions");

        }
    suggest(suggestions);
}

function handleCommands(text){
    suggestions = [];
    params = text.split(" ");
    command_part = params[0];

    if (params.length == 2 && params[1]){
        alias = params[1];
    }


    // if (params[0] == '#add' && params.length == 2 && params[1]){
    //     return chrome.omnibox.setDefaultSuggestion(
    //         {description: "Adding " + addXMLMatch(params[1]) + " --> " + addXMLUrl(varifyXML(current_url))}
    //     );
    // }
    //
    // if (params[0] == '#remove' && params.length == 2 && params[1]){
    //     if (params[1] in aliases){
    //         return chrome.omnibox.setDefaultSuggestion(
    //             {description: "Removing " + addXMLMatch(params[1]) + " --> " + addXMLUrl(varifyXML(aliases[params[1]]))}
    //         );
    //     }
    //     return chrome.omnibox.setDefaultSuggestion(
    //         {description: "Unknown Alias"}
    //     );
    // }
    // setBaseDefaultSuggestion();
    setCommandsDefaultSuggestion();
    for (var comm in commands){
        match = comm.replace(command_part, addXMLMatch(command_part));
        description = match + ": " + commands[comm];
        if (command_part == comm){
            chrome.omnibox.setDefaultSuggestion({description: description});
        }
        else {
            suggestions.push(getSuggestion(comm, description));
        }

    }
    return suggestions;

}


function getSuggestion(content, desc){
    return {content: content, description: varifyXML(desc)};
}

function setDefaultSuggestion(text){
    chrome.omnibox.setDefaultSuggestion({description: varifyXML(text)});
}

function setBaseDefaultSuggestion(){
    setDefaultSuggestion('<match>Alias</match>: Enter an alias or # for commands menu');
}

function setCommandsDefaultSuggestion(){
    setDefaultSuggestion('<match>Commands</match>: Enter one of the following commands');
}

function addAlias(alias){
    aliases[alias] = current_url;
    chrome.storage.local.set({"aliases": aliasses});
}

function removeAlias(alias){
    delete aliases.alias;
    chrome.storage.local.set({"aliases": aliasses});
}

function showAliases(){
    console.log(aliases);
}

function varifyXML(text){
    var fixed_text = text;
    fixed_text = fixed_text.replace('"', "&quot;");
    fixed_text = fixed_text.replace("'", "&apos;");
    fixed_text = fixed_text.replace('<', "&lt;");
    fixed_text = fixed_text.replace('>', "&gt;");
    fixed_text = fixed_text.replace('&', "&amp;");
    return fixed_text;
}

function addXMLMatch(text){
    return "<match>"+text+"</match>";
}

function addXMLUrl(text){
    return "<url>"+text+"</url>";
}

function loadAliases(){
    chrome.storage.local.get("aliases", function(result){
        if (result.aliases)
            aliases = result.aliases;
    });
}

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

function setCurrentUrl(){
    chrome.tabs.query({active: true}, function(t){current_url = t[0].url;});
}
