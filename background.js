var storage = chrome.storage.local;
var aliases;
var current_url;
var commands = {
    '#add'   : addXMLDim('alias') + ' - Creates an alias for the current url',
    '#remove': addXMLDim('alias') + ' - Removes an existing alias',
    '#show'  : '- Show all aliases',
    '#purge' : '- Remove all aliases',
    // '#rename': ' <alias> <new alias> - Change name of an alias'
};

loadAliases();


chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
      suggest(getSuggestionsByInput(text.trim()));
  }
);

chrome.omnibox.onInputStarted.addListener(
    function(){
        setCurrentUrl();
        setBaseDefaultSuggestion();
    }
);


chrome.omnibox.onInputEntered.addListener(
    function(text) {
        executeRequest(text.trim());
    }
);

function executeRequest(text){
    [comm, data] = parseInput(text);

    if (comm == 'alias'){
        if (data in aliases)
            navigate(aliases[data]);
    }

    if (comm == 'add'){
        addAlias(data);
    }

    if (comm == 'remove'){
        if (data in aliases)
            removeAlias(data);
    }

    if (comm == 'show'){
        showAliases();
    }

    if (comm == 'purge'){
        purgeAliases();
    }
}


function getSuggestionsByInput(text){
    setBaseDefaultSuggestion();
    [comm, data] = parseInput(text);

    if (comm == 'command'){
        return DefaultCommandSuggestions(data);
    }

    if (comm == 'alias')
        return DefaultAliasSuggestions(data);

    if (comm == 'add'){
        setDefaultSuggestion("Enter to add " + addXMLMatch(data) + ' as ' + addXMLUrl(varifyXML(current_url)));
        return [];
    }

    if (comm == 'remove'){
        if (data in aliases)
            setDefaultSuggestion("Enter to remove " + addXMLMatch(data) + ' as ' + addXMLUrl(varifyXML(aliases[data])));
        else {
            setDefaultSuggestion("Unknown alias for removal");
        }
        return [];
    }

    if (comm == 'show'){
        setDefaultSuggestion("Enter to show all aliases");
        return [];
    }

    if (comm == 'purge'){
        setDefaultSuggestion("Enter to remove all aliases");
        return [];
    }

    if (comm == 'illegal'){
        setDefaultSuggestion("Illegal operation");
        return [];
    }

    if (comm == 'empty'){
        return [];
    }
}

function parseInput(text){
    if (text === '')
        return ['empty'];
    if (text.startsWith('#')){
        params = text.split(" ");
        command_part = params[0];
        if (params.length == 1){
            if (command_part == '#show')
                return ['show'];
            if (command_part == '#purge')
                return ['purge'];
        }
        if (params.length == 2 && params[1]){
            alias = params[1];
            if (command_part == '#add')
                return ['add', alias];
            if (command_part == '#remove')
                return ['remove', alias];
            return ['illegal'];
        }
        if (params.length > 2)
            return ['illegal'];
        return ['command', text];
    }
    return ['alias', text];
}

function getSuggestion(content, desc){
    return {content: content, description: desc};
}

function setDefaultSuggestion(desc){
    chrome.omnibox.setDefaultSuggestion({description: desc});
}

function setBaseDefaultSuggestion(){
    setDefaultSuggestion('<match>Alias</match>: Enter an alias - # for commands menu');
}

function DefaultCommandSuggestions(command_part){
    setDefaultSuggestion('<match>Commands</match>: Enter one of the following commands');
    suggestions = [];
    for (var comm in commands){
        match = comm.replace(command_part, addXMLMatch(command_part));
        description = match + ' ' + commands[comm];
        if (command_part == comm){
            chrome.omnibox.setDefaultSuggestion({description: description});
        }
        else {
            suggestions.push(getSuggestion(comm, description));
        }
    }
    return suggestions;
}

function DefaultAliasSuggestions(alias){
    setBaseDefaultSuggestion();
    if (alias in aliases){
        setDefaultSuggestion('Go to: ' + addXMLMatch(alias) + ' - ' + addXMLUrl(varifyXML(aliases[alias])));
        return [];
    }
    suggestions = [];
    for (var key in aliases){
        url = addXMLUrl(varifyXML(aliases[key]));
        if (key.includes(alias)){
            match = key.replace(alias, addXMLMatch(alias));
            suggestions.push(getSuggestion(key, match + ': ' + url));
        }
    }
    return suggestions;
}

function varifyXML(text){
    var fixed_text = text;
    fixed_text = fixed_text.replace('&', "&amp;");
    fixed_text = fixed_text.replace('"', "&quot;");
    fixed_text = fixed_text.replace("'", "&apos;");
    fixed_text = fixed_text.replace('<', "&lt;");
    fixed_text = fixed_text.replace('>', "&gt;");
    console.log("original: " + text + " fixed: " + fixed_text);
    return fixed_text;
}

function addXMLMatch(text){
    return "<match>"+text+"</match>";
}

function addXMLDim(text){
    return "<dim>"+text+"</dim>";
}

function addXMLUrl(text){
    return "<url>"+text+"</url>";
}

function loadAliases(){
    storage.get("aliases", function(result){
        if (result.aliases){
            console.log("Loading Aliases from DB");
            aliases = result.aliases;
            return;
        }
        console.log("Couldn't find aliases in DB - setting aliases to empty");
        aliases = {};
        return;
    });
}

function addAlias(alias){
    aliases[alias] = current_url;
    updateAliases();
}

function removeAlias(alias){
    delete aliases[alias];
    updateAliases();
}

function updateAliases(){
    storage.set({"aliases": aliases}, function(){
        console.log("Updating Aliases in DB");
        loadAliases();
    });
}

function showAliases(){
    console.log(aliases);
}

function purgeAliases(){
    storage.remove("aliases", function(){
        console.log("Purged all aliases");
        loadAliases();
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
