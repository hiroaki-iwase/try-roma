function changeStyleToHash(json) {
    hash_str = json.replace(/", "/g,'"=>"').replace(/\]\[/g,', ').replace(/\[/,'{').replace(/\]/,'}');
    return hash_str;
}

function clearForm(){
    React.findDOMNode(this.refs.command).value = '';
}

function showResult(res) {
    var lastcmd = '> '+window.sessionStorage.getItem(['lastcmd'])
    return lastcmd + res;
}

function refactorStatResult(res) {
    res_lines = '';
    for(var i in res){
        res_lines += ("<br>"+i +" "+ res[i]);
    }
    return res_lines;
}


function disabledForm() {
    React.findDOMNode(this.refs.command).disabled = 'true';
    React.findDOMNode(this.refs.command).placeholder = 'Please Reload';
}


function makeNodeDownMsg(cmd){

    if (cmd == 'shutdown_self') {
        var nonActiveMessage = this.state.nodeList.shift() + ' was down.<br>So Try ROMA access the next node.'
        var nlist= ''
        for(var i in this.state.nodeList){
            nlist += ("    - "+ this.state.nodeList[i] +"<br>");
        }
        var activeMessage = "Active Nodes are <br>" + nlist
    }

    if ((/^(balse|shutdown)$/.test(cmd)) || (this.state.nodeList.length == 0)) {
        var nonActiveMessage = 'All nodes were down!!<br>Please Reload.'
        var activeMessage = ''
        disabledForm.bind(this)();
    }

    this.setState({downNodeMsg:  nonActiveMessage})
    this.setState({aliveNodeMsg: activeMessage})
}

function checkSecondValue(cmd) {
    var firstCmd = window.sessionStorage.getItem(['lastcmd']); // past command
    var secondCmd = cmd; // confirm command
    window.sessionStorage.setItem(['lastcmd'],[secondCmd]);

    switch (true) {
        case /^(balse|shutdown|shutdown_self)$/.test(firstCmd):
            if (secondCmd) {
                var res = sendAjax.bind(this)('DELETE', { command: firstCmd, confirmation: secondCmd });
            } else {
                var res = sendAjax.bind(this)('DELETE', { command: firstCmd, confirmation: 'nothing' });
            }

            if (secondCmd == 'yes') {
                 makeNodeDownMsg.bind(this)(firstCmd);
            }
            break;

        case /^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(firstCmd) :
            var res = sendAjax.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, value: secondCmd });
            break;

        case /^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(firstCmd) :
            var res = sendAjax.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, casid: RegExp.$5, value: secondCmd});
            break;

    }
    
    window.sessionStorage.removeItem(['requireNext']);
    clearForm.bind(this)();

    return res;
}


//function getCommand(cmd) {
//    var command = '';
//    switch (true) {
//        case /^stats$/.test(cmd) :
//            command = "* stat|stats";
//            break;
//        case /^stats node$/.test(cmd) :
//            command = "* stat|stats <regexp>";
//            break;
//        case /^nodelist$/.test(cmd) :
//            command = "* nodelist";
//            break;
//        case /^set foo 0 0 3$/.test(cmd) :
//            command = "* set <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^bar$/.test(cmd) :
//            command = "* set <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^get foo$/.test(cmd) :
//            command = "* get <key>";
//            break;
//        case /^add foo 0 0 3$/.test(cmd) :
//            command = "* add <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^baz$/.test(cmd) :
//            command = "* add <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^add hoge 0 0 4$/.test(cmd) :
//            command = "* add <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^fuga$/.test(cmd) :
//            command = "* add <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^get hoge$/.test(cmd) :
//            command = "* add <key> <flag> <exptime> <value size>\\n<value>";
//            break;
//        case /^delete foo$/.test(cmd) :
//            command = "* delete <key>";
//            break;
//        //case /^set_expt foo 1$/.test(cmd) :
//        //    command = "* set_expt <key> <exptime>";
//        //    break;
//        case /^release$/.test(cmd) :
//            explain = "<br>So please input below command and push Enter key.<br><br>> release"
//            break;
//    }
//    return command;
//}


function getCommandUsage(cmd) {
    return [
        "* stat|stats",
        "* stat|stats <regexp>",
        "* nodelist",
        "* set <key> <flag> <exptime> <value size>\\n<value>",
        "* set <key> <flag> <exptime> <value size>\\n<value>",
        "* get <key>",
        "* add <key> <flag> <exptime> <value size>\\n<value>",
        "* add <key> <flag> <exptime> <value size>\\n<value>",
        "* add <key> <flag> <exptime> <value size>\\n<value>",
        "* add <key> <flag> <exptime> <value size>\\n<value>",
        "* add <key> <flag> <exptime> <value size>\\n<value>",
        "* delete <key>",
    ]
}


function getCommandExplanation() {
    return [
        "Firstly Let's check ROMA's cluster status.<br>" +
        "This command will display all of the cluster status.<br>" + 
        "<br>So please input below command and push Enter key.<br>> stats",

        "[stat|stats] command display the all of parameters,<br>" +
        "so it is hard to check specific one.<br>" + 
        "But you can use regular expression as a argument.<br>" + 
        "<br>So please input below command and push Enter key.<br>> stats node",

        "Next let's check current nodelist without using stats.<br>" + 
        "ROMA has the command which check the just alive nodelist.<br>" + 
        "<br>So please input below command and push Enter key.<br>> nodelist",

        "Next is a data store command.<br>" +
        "this command store the data.<br>" +
        "<br>So please input below command and push Enter key.<br>> set foo 0 0 3",

        "Next is a data store command.<br>" +
        "this command store the data.<br>" +
        "<br>So please input below command and push Enter key.<br>> set foo 0 0 3<br>" +
        "<br>So please input below command and push Enter key.<br>> bar",

        "Next is a data getting command.<br>" +
        "This command search and display the data.<br>" +
        "<br>So please input below command and push Enter key.<br>> get foo",

        "Next is a data adding command.<br>" +
        "This command is similar to set command,<br> " +
        "but add command set the data unless specified key is already exist." +
        "Fistly, try add to exist key data.<br>" +
        "<br>So please input below command and push Enter key.<br>> add foo 0 0 3",

        "Next is a data adding command.<br>" +
        "This command is similar to set command,<br> " +
        "but add command set the data unless specified key is already exist." +
        "Fistly, try add to exist key data.<br>" +
        "<br>So please input below command and push Enter key.<br>> add foo 0 0 3" +
        "<br>So please input below command and push Enter key.<br>> baz",

        "Next is a data adding command.<br>" +
        "This command is similar to set command,<br> " +
        "but add command set the data unless specified key is already exist." +
        "Fistly, try add to exist key data.<br>" +
        "<br>So please input below command and push Enter key.<br>> add foo 0 0 3" +
        "<br>So please input below command and push Enter key.<br>> baz" +
        "<br>Next, tyr add to Non exist data<br>." +
        "<br>So please input below command and push Enter key.<br>> add hoge 0 0 4",

        "Next is a data adding command.<br>" +
        "This command is similar to set command,<br> " +
        "but add command set the data unless specified key is already exist." +
        "Fistly, try add to exist key data.<br>" +
        "<br>So please input below command and push Enter key.<br>> add foo 0 0 3<>" +
        "<br>So please input below command and push Enter key.<br>> baz" +
        "<br><br>Next, try add to Non exist data.<br>" +
        "<br>So please input below command and push Enter key.<br>> add hoge 0 0 4" + 
        "<br>So please input below command and push Enter key.<br>> fuga",

        "Let's confirm the stored data(of key name is hoge).<br>" +
        "<br>So please input below command and push Enter key.<br>> get baz",

         // delete
        "Next is a data deletion command.<br>" + 
        "This command remove the data.<br>" +
        "<br>So please input below command and push Enter key.<br>> delete foo",
     //explain = "ROMA can set expired time.<br>When passed over expired time, data will be remove automatically.<br>Usage:<br>set_expt <key> <exptime><br>Setting rule is same of memcached.<br>If the value is 0 then the data will not be expired.<br>So please input below command and push Enter key.<br><br>> set_expt baz 1"
    ]
}

//function getExplanation(cmd) {
//    var explain = '';
//    switch (true) {
//        case /^stats$/.test(cmd) :
//            explain = "Firstly Let's check ROMA's cluster status.<br>"
//                    + "This command will display all of the cluster status.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> stats";
//            break;
//        case /^stats node$/.test(cmd) :
//            explain = "[stat|stats] command display the all of parameters,<br>"
//                    + "so it is hard to check specific one.<br>"
//                    + "But you can use regular expression as a argument.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> stats node"
//            break;
//        case /^nodelist$/.test(cmd) :
//            explain = "Next let's check current nodelist without using stats.<br>"
//                    + "ROMA has the command which check the just alive nodelist.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> nodelist"
//            break;
//        case /^set foo 0 0 3$/.test(cmd) :
//            explain = "Next is a data store command.<br>"
//                    + "this command store the data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> set foo 0 0 3"
//            break;
//        case /^bar$/.test(cmd) :
//            explain = "Next is a data store command.<br>"
//                    + "this command store the data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> set foo 0 0 3<br>"
//                    + "<br>So please input below command and push Enter key.<br>> bar"
//            break;
//        case /^get foo$/.test(cmd) :
//            explain = "Next is a data getting command.<br>"
//                    + "This command search and display the data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> get foo"
//            break;
//        case /^add foo 0 0 3$/.test(cmd) :
//            explain = "Next is a data adding command.<br>"
//                    + "This command is similar to set command,<br> "
//                    + "but add command set the data unless specified key is already exist."
//                    + "Fistly, try add to exist key data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> add foo 0 0 3"
//            break;
//        case /^baz$/.test(cmd) :
//            explain = "Next is a data adding command.<br>"
//                    + "This command is similar to set command,<br> "
//                    + "but add command set the data unless specified key is already exist."
//                    + "Fistly, try add to exist key data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> add foo 0 0 3"
//                    + "<br>So please input below command and push Enter key.<br>> baz"
//            break;
//        case /^add hoge 0 0 4$/.test(cmd) :
//            explain = "Next is a data adding command.<br>"
//                    + "This command is similar to set command,<br> "
//                    + "but add command set the data unless specified key is already exist."
//                    + "Fistly, try add to exist key data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> add foo 0 0 3"
//                    + "<br>So please input below command and push Enter key.<br>> baz"
//                    + "<br>Next, tyr add to Non exist data<br>."
//                    + "<br>So please input below command and push Enter key.<br>> add hoge 0 0 4"
//            break;
//        case /^fuga$/.test(cmd) :
//            explain = "Next is a data adding command.<br>"
//                    + "This command is similar to set command,<br> "
//                    + "but add command set the data unless specified key is already exist."
//                    + "Fistly, try add to exist key data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> add foo 0 0 3<>"
//                    + "<br>So please input below command and push Enter key.<br>> baz"
//                    + "<br><br>Next, try add to Non exist data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> add hoge 0 0 4"
//                    + "<br>So please input below command and push Enter key.<br>> fuga"
//            break;
//        case /^get hoge$/.test(cmd) :
//            explain = "Let's confirm the stored data(of key name is hoge).<br>"
//                    + "<br>So please input below command and push Enter key.<br>> get baz"
//            break;
//        case /^delete foo$/.test(cmd) :
//            explain = "Next is a data deletion command.<br>"
//                    + "This command remove the data.<br>"
//                    + "<br>So please input below command and push Enter key.<br>> delete foo"
//            break;
//
//        case /^set_expt baz 1$/.test(cmd) :
//            explain = "ROMA can set expired time.<br>When passed over expired time, data will be remove automatically.<br>Usage:<br>set_expt <key> <exptime><br>Setting rule is same of memcached.<br>If the value is 0 then the data will not be expired.<br>So please input below command and push Enter key.<br><br>> set_expt baz 1"
//            break;
//        case /^release$/.test(cmd) :
//            explain = "<br>So please input below command and push Enter key.<br><br>> release"
//            break;
//    }
//    return explain;
//}

//function showTutorialMessage(cmd) {
//    if (cmd == window.sessionStorage.getItem(['nextCommand'])) {
//        /* corrent command was pushed */
//        clearHeader.bind(this)();
//
//        //sendAjax.bind(this)('GET', null, cmd, 'json'); /* todo*/
//        sendRomaCommand.bind(this)(cmd, true)
//
//        React.findDOMNode(this.refs.command).placeholder = 'Good!! Please push Enter key to go next commands.';
//
//    } else if (cmd == '') {
//        /* push enter key with brank */
//        clearHeader.bind(this)();
//        //React.findDOMNode(this.refs.result).value = '';
//        this.setState({result: ''});
//
//        var nextCommand = $tutorialCommands.shift();
//
//        window.sessionStorage.setItem(['nextCommand'], nextCommand);
//        this.setState({tutorialExplain: getExplain(nextCommand)});
//        React.findDOMNode(this.refs.command).placeholder = nextCommand;
//    } else {
//       /* mistake command */
//        var res = '> ' + cmd + '<br>Please input [' + window.sessionStorage.getItem(['nextCommand']) + '] command';
//        this.setState({result: res});
//    } 
//
//    if (nextCommand == 'set foo 0 0 3') {
//        $('#side-bar > ul > li:nth-of-type(1)').css({'color':'gray'});
//        $('#side-bar > ul > li:nth-of-type(2)').css({'color':'red'});
//    } else if (nextCommand == 'release') {
//        $('#side-bar > ul > li:nth-of-type(2)').css({'color':'gray'});
//        $('#side-bar > ul > li:nth-of-type(3)').css({'color':'red'});
//    } else if (nextCommand == 'recover') {
//        $('#side-bar > ul > li:nth-of-type(3)').css({'color':'gray'});
//        $('#side-bar > ul > li:nth-of-type(4)').css({'color':'red'});
//    }
//}
//
//function startTutorial() {
//    $('#side-bar').css({'visibility':'visible'});
//    $('#side-bar > ul > li:nth-of-type(1)').css({'color':'red'});
//}



function sendAjax(action, data, url, format) {
    var path = url || '';
    var response = '';

    $.ajax({
        url: "../"+path,
        type: action,
        data: data,
        dataType: format,
        cache: false,
        async: false,
    }).done(function(res){
        if (action == 'PUT') {
          res = changeStyleToHash(res);
        } 
        if (format == 'json') {
            res = refactorStatResult(res);
        }
        response = '> '+window.sessionStorage.getItem(['lastcmd']) + '<br>' + res + '<br>';
    }.bind(this)).fail(function(){
        response = 'API Request was failed ';
    }.bind(this)).responseText;

    return response;
}

function changePlaceHolder(str) {
    React.findDOMNode(this.refs.command).placeholder = str;
}


function sendRomaCommand(cmd, tutorialMode) {
    //tutorialMode = tutorialMode || checkTutorialMode()

    var data = null;
    if (/^(stats|stat|whoami|nodelist|version|get|gets)/.test(cmd)) {
        var action = 'GET';
        if (/^(stats|stat)(\s(.*))*$/.test(cmd)) {
            var url = RegExp.$1+"/"+RegExp.$3;
            var dataType = 'json';

        } else if (/^(whoami|nodelist|version)$/.test(cmd)) {
            var url = RegExp.$1;

        } else if (/^(get|gets)\s(.+)$/.test(cmd)) { 
            var url = RegExp.$1+"/"+RegExp.$2;
        }
    } else if (/^(set|add|replace|append|prepend|cas|set_expt|incr|decr|delete)/.test(cmd)) {
        if (/^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(cmd)) {
            window.sessionStorage.setItem(['requireNext'],[true]);
            changePlaceHolder.bind(this)('please input value');
            var res = showResult.bind(this)('');
            //if (tutorialMode) {
            //    React.findDOMNode(this.refs.command).value = '';
            //    React.findDOMNode(this.refs.command).placeholder = 'bar';
            //    this.setState({tutorialExplain: 'Please input value(bar).'});
            //}

        } else if (/^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(cmd)) {
            window.sessionStorage.setItem(['requireNext'],[true]);
            changePlaceHolder.bind(this)('please input value');
            var res = showResult.bind(this)('');

        } else if (/^(set_expt)\s([a-z0-9]+)\s([0-9]+)$/.test(cmd)) {
            var action = 'POST';
            data = { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3 };

        } else if (/^(incr|decr)\s([a-z0-9]+)\s([-]*[0-9]+)$/.test(cmd)) {
            var action = 'POST';
            data = { command: RegExp.$1, key: RegExp.$2, digit: RegExp.$3 };

        } else if (/^(delete)\s([a-z0-9]+)$/.test(cmd)) {
            var action = 'POST';
            data = { command: RegExp.$1, key: RegExp.$2 };
        }
    } else if (/^(release|recover|set_lost_action|set_auto_recover|set_log_level)/.test(cmd)) {
        var action = 'PUT';
        if (/^(release|recover)$/.test(cmd)) {
            data = {command: RegExp.$1};
        } else if (/^(set_lost_action)\s(.+)$/.test(cmd)) {
            data = {command: RegExp.$1, level: RegExp.$2, lost: RegExp.$2};
        } else if (/^(set_auto_recover)\s([a-z]+)\s*([0-9]*)$/.test(cmd)) {
            data = {command: RegExp.$1, bool: RegExp.$2, sec: RegExp.$3};
        } else if (/^(set_log_level)\s([a-z]+)$/.test(cmd)) {
            data = {command: RegExp.$1, level: RegExp.$2};
        }
    } else if (/^(balse|shutdown|shutdown_self)$/.test(cmd)) {
        var action = 'DELETE';
        var firstCmd = RegExp.$1;
        data = { command: firstCmd, confirmation: null };
        
        if (/^(balse|shutdown|shutdown_self)$/.test(firstCmd)) {
            window.sessionStorage.setItem(['requireNext'],[true]);
        }
    } else if (/^(rbalse)$/.test(cmd)) {
          var res = showResult.bind(this)('<br>rbalse is deprecated command, please use [shutdown_self] command<br>');
    } else if (/^()$/.test(cmd)) {
          var res = '> ';
    //} else if (/^(!!)$/.test(cmd)) {
    //      var lastcmd = window.sessionStorage.getItem(['lastcmd']);
    //      sendPureCommand(lastcmd);
    } else {
          var res = showResult.bind(this)('<br>Not Supported<br>');
    }

    if (action) {
        var res = sendAjax.bind(this)(action, data, url, dataType);
    }

    clearForm.bind(this)();
    return res;

}


function sendPureCommand(cmd) {

        //if (window.sessionStorage.getItem(['tutorialFlag'])) {
        //    // tutorial mode
        //    window.sessionStorage.setItem(['lastcmd'],[e.target.value]);
        //    showTutorialMessage.bind(this)(e.target.value);
        //} else {
            // free mode



            this.setState({downNodeMsg: ''})
            this.setState({aliveNodeMsg: ''})

            if (window.sessionStorage.getItem(['requireNext'])) {
                var res = checkSecondValue.bind(this)(cmd);
                React.findDOMNode(this.refs.command).placeholder = 'please input command';
                return res;
            } else {
                window.sessionStorage.setItem(['lastcmd'],[cmd]);

                var res = sendRomaCommand.bind(this)(cmd);
                return res;
            }

        //}
}

function lines(line){
    if (line) {
        return (<p className='no-margin'>{line}</p>);
    } else {
        return (<p className='no-margin'>&nbsp;</p>);
    }
}

function clearHeader(){
    this.setState({greetingAA: ''})
    this.setState({greetingMessage: ''})
    this.setState({tutorialExplain: ''})
    this.setState({redMsg: ''})
    this.setState({greenMsg: ''})
}

function heardoc_main() {
    var heredoc = (function () {/*
 _ _ _       _  _                          _    _           _____  _____  __ __    _____  _____  _____  _____ 
| | | | ___ | || | ___  ___  _____  ___   | |_ | |_  ___   |_   _|| __  ||  |  |  | __  ||     ||     ||  _  |
| | | || -_|| || ||  _|| . ||     || -_|  |  _||   || -_|    | |  |    -||_   _|  |    -||  |  || | | ||     |
|_____||___||_||_||___||___||_|_|_||___|  |_|  |_|_||___|    |_|  |__|__|  |_|    |__|__||_____||_|_|_||__|__|
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    return heredoc;
}

function heardoc_tutorial() {
    var heredoc = (function () {/*
 _____     _           _     _    _____       _     
|_   _|_ _| |_ ___ ___|_|___| |  |     |___ _| |___ 
  | | | | |  _| . |  _| | .'| |  | | | | . | . | -_|
  |_| |___|_| |___|_| |_|__,|_|  |_|_|_|___|___|___|
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    return heredoc;
}

function getCommandList() {
    return [
        'stats', 
        'stats node', 
        'nodelist', 
        'set foo 0 0 3',
        'bar', 
        'get foo',
        'add foo 0 0 3',
        'baz',
        'add hoge 0 0 4',
        'fuga',
        'get hoge',
        'delete foo',
        //'set_expt baz 1',
        //'get baz',
        //'shutdown_self',
        //'stat short'
        //'recover',
        //'stat short',
        //'set_auto_recover'
        //'release',
        //'stat primary|secondary',
        //'shutdown_self',
    ]
}


//5(parent)
var Console = React.createClass(
    {
        getDefaultProps() {
            return {
                ENTER: 13,
                mode: "free",
            };
        },
        getInitialState() {
            return {
                res: "",
                downNodeMsg: "",
                aliveNodeMsg: "",
                nodeList: ['localhost_10001', 'localhost_10002', 'localhost_10003', 'localhost_10004', 'localhost_10005'],
                tutorialCommandList: getCommandList(),
                tutorialCommandUsage: getCommandUsage(),
                tutorialCommandExplanation: getCommandExplanation(),
                placeholder: 'Please input command',
                explain: '',
            };
        },
        componentWillReceiveProps(nextProps) {
        },
        sendCommand(e) {
            if(e.keyCode == this.props.ENTER){
                if (this.props.mode == 'free') {
                    var response = sendPureCommand.bind(this)(e.target.value);
                    this.setState({res: response});

                } else if (this.props.mode == 'tutorial') {
                    if (e.target.value == '') {
                        var nextCmd = this.state.tutorialCommandList.shift();

                        if (this.state.tutorialCommandList.length != 0) {
                            changePlaceHolder.bind(this)(nextCmd);
                            this.setState({cmd: this.state.tutorialCommandUsage.shift()});
                            //this.setState({explain: getExplanation(nextCmd)});
                            this.setState({explain: this.state.tutorialCommandExplanation.shift()});
                        } else {
                            // finish tutorial mode
                            console.log('empty!!');
                        }

                    } else {
                        //var response = sendTutorialCommand.bind(this)(e.target.value);
                        //if (response) {
                        //    response += "<br><br>Good!! Let's go Next Command, please push Enter."
                        //    this.setState({res: response});
                        // } else {
                        //     var retryRes = showResult.bind(this)('<br>please input ****** command<br>');
                        //     this.setState({res: retryRes});
                        // }
                    }
                } 
            } 
        },
        render: function() {
            var nodeMsg = {
                nonActive: this.state.downNodeMsg,
                active: this.state.aliveNodeMsg,
            };

            var whichModeHeader;
            if (this.props.mode == 'free') {
                whichModeHeader = <FreeHeader nodeMsg={nodeMsg} />;
            } else if (this.props.mode == 'tutorial') {
                whichModeHeader = <TutorialHeader cmd={this.state.cmd} explain={this.state.explain}/>;
            }

            var whichModeDisplay;
            if (this.props.mode == 'free') {
                whichModeDisplay = <FreeDisplay response={this.state.res} />;
            } else if (this.props.mode == 'tutorial') {
                whichModeDisplay = <TutorialDisplay response={this.state.res} />;
            }

            return (
              <div id="console-screen">

                {whichModeHeader}
                {whichModeDisplay}

                <div id='inputArea'>
                  <p className='no-margin'>&gt; <input id='inputBox' type="text" placeholder={this.state.placeholder} onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
              </div>
            );
        }
    }
);



//8(child)
var FreeHeader = React.createClass(
    {
        getDefaultProps() {
            return {
                greetingAA: heardoc_main(),
                greetingMessage: 'Please feel free to execute ROMA command!!',
            };
        },
        getInitialState() {
            return {
                greetingAA: this.props.greetingAA,
                greetingMessage: this.props.greetingMessage,

                //tutorialExplain: '',

                redMsg: '',
                greenMsg: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            clearHeader.bind(this)();
            this.setState({redMsg: nextProps.nodeMsg['nonActive']});
            this.setState({greenMsg: nextProps.nodeMsg['active']});
        },
        render: function() {
            var style = {
                greeting: {
                    color: '#00cede',
                },
                greetingAA: {
                    fontSize: '11px',
                },
                greetingMsg: {
                    fontSize: '20px',
                },
                nonActive: {
                    color: 'red',
                    fontSize: '33px',
                },
                active: {
                    color: 'lime',
                    fontSize: '20px',
                },
            };
            return (
                <div>
                  <div style={style.greeting}>
                    <div style={style.greetingAA}>{this.state.greetingAA}</div>
                    <div style={style.greetingMsg}>{this.state.greetingMessage}</div>
                  </div>
                  <div>
                    <div style={style.nonActive}>{this.state.redMsg.split('<br>').map(lines)}</div>
                    <div style={style.active}>{this.state.greenMsg.split('<br>').map(lines)}</div>
                  </div>
                </div>
            );
        }
    }
);

var TutorialHeader = React.createClass(
    {
        //getDefaultProps() {
        //    return {
        //        explain: "This mode is tutorial of ROMA basic usage.<br>This mode explain ROMA command one by one.<br><br>Let's start tutorial!!<br>Please push Enter Key ",
        //    };
        //},
        getInitialState() {
            return {
                greetingAA: heardoc_tutorial(),
                greetingMessage: "This mode is tutorial of ROMA basic usage.<br>This mode explain ROMA command one by one.<br><br>Let's start tutorial!!<br>Please push Enter Key ",
                cmd: '',
                explain: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            clearHeader.bind(this)();
            this.setState({explain: nextProps.explain});
            this.setState({cmd: nextProps.cmd});
        },
        render: function() {
            var style = {
                greeting: {
                    color: '#00cede',
                },
                greetingAA: {
                    fontSize: '15px',
                },
                greetingMsg: {
                    fontSize: '25px',
                },
                explain: {
                    color: 'lime',
                },
                tutorialCmd: {
                    fontSize: '30px',
                    textDecoration: 'underline',
                },
                tutorialMsg: {
                    fontSize: '25px',
                    marginLeft: '25px',
                },
            };
            return (
                <div>
                  <div style={style.greeting}>
                    <div style={style.greetingAA}>{this.state.greetingAA}</div>
                    <div style={style.greetingMsg}>{this.state.greetingMessage.split('<br>').map(lines)}</div>
                  </div>
                  <div style={style.explain}>
                    <div style={style.tutorialCmd}>{this.state.cmd}</div>
                    <div style={style.tutorialMsg}>{this.state.explain.split('<br>').map(lines)}</div>
                  </div>
                </div>
            );
        }
    }
);


//4(child)
var FreeDisplay = React.createClass(
    {
        getInitialState() {
            return {
                result: "",
                response: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            if (nextProps.response.lastIndexOf('BYE') == -1) {
                this.setState({response: this.state.response + '<br>' + nextProps.response});
            } else {
                this.setState({response: nextProps.response});
            }
        },
        render: function() {
            return (
                <div id="responseArea">
                  {this.state.response.split('<br>').map(lines)}
                </div>
            );
        }
    }
);

var TutorialDisplay = React.createClass(
    {
        getInitialState() {
            return {
                result: "",
                response: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            if (nextProps.response.lastIndexOf('BYE') == -1) {
                this.setState({response: this.state.response + '<br>' + nextProps.response});
            } else {
                this.setState({response: nextProps.response});
            }
        },
        render: function() {
            return (
                <div id="responseArea">
                  {this.state.response.split('<br>').map(lines)}
                </div>
            );
        }
    }
);

var Title = React.createClass(
    {
        render: function() {
            return (
                <div id='title'>
                  <center>
                    Try R<img src="../img/ROMA.png" id='title-image'/>MA
                  </center>
                </div>
            );
        }
    }
);

var SelectModeButton = React.createClass(
    {
        getInitialState() {
            return{
                mode: 'free',
            };
        },
        selectMode(e) {
            if (e.target.name == 'tutorial') {
console.log('selected tutorial mode!!')
                $("#tutorial-button").prop("disabled", true);
                $("#free-button").hide('slow', function(){$("#free-button").remove();});
                $('#console-screen').animate({'margin-left':'220px', 'margin-right':'20px'}, 500);
                //startTutorial.bind(this)();
                this.setState({mode: 'tutorial'});

            } else if (e.target.name == 'free') {
                // todo css animation
                $("#free-button").prop("disabled", true);
                $("#tutorial-button").hide('slow', function(){$("#tutorial-button").remove();});
                this.setState({mode: 'free'});
            }
        },
        render: function() {
            return (
                <div>
                  <div id='mode-button'>
                    <center>
                      <button id='tutorial-button' type="button" name="tutorial" onClick={this.selectMode}>
                        Tutorial mode
                      </button>
                      <button id='free-button' type="button" name="free" onClick={this.selectMode}>
                        Free mode
                      </button>
                    </center>
                  </div>

                  <Main mode={this.state.mode} />

                </div>
            );
        }
    }
);

var Main = React.createClass(
    {
        getDefaultProps() {
            return {
                mode: 'free',
            };
        },
        render: function() {
            return (
                <div>
                  {/*<SideBar mode={this.state.mode} />*/}
                  <Console mode={this.props.mode} />
                </div>
            );
        }
    }
);

//2
var TutorialSideBar = React.createClass(
    {
        render: function() {
            return (
                <span id='side-bar'>
                  <ul>
                    <li>Check Status</li>
                    <ul className='tutorial-commands'>
                      <li>stat</li>
                      <li>nodelist</li>
                    </ul>
                    <li>Manage Data</li>
                    <ul className='tutorial-commands'>
                      <li>set</li>
                      <li>get</li>
                      <li>delete</li>
                      <li>add</li>
                      <li>set_expt</li>
                    </ul>
                    <li>Instance shutdown</li>
                    <ul className='tutorial-commands'>
                      <li>release</li>
                      <li>shutdown_self</li>
                    </ul>
                    <li>Recover redundancy</li>
                    <ul className='tutorial-commands'>
                      <li>recover</li>
                      <li>set_auto_recover</li>
                    </ul>
                  </ul>
                </span>
            );
        }
    }
);

//6
var FooterInfo = React.createClass(
    {
        render: function() {
            return (
                <div>
                  <center>
                    <p className='no-margin'>This site was inspired by Try Redis.</p>
                    <p className='no-margin'>The source code to Try ROMA is available on <a href='https://github.com/hiroaki-iwase/try-roma'>GitHub</a>.</p>
                  </center>
                </div>
            );
        }
    }
);

var TryRoma = React.createClass(
    {
        render: function() {
            return (
                <div>
                  <Title />
                  <SelectModeButton />
                  {/*<TutorialSideBar />*/}
                  <FooterInfo />
                </div>
            );
        }
    }
);

React.render(<TryRoma />, document.getElementById("reactArea"));

