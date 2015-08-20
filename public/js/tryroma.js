/*
 *  =========================================
 *    JavaScript
 *  =========================================
 *     
*/
function clearHeader(){
    this.setState({greetingAA: ''})
    this.setState({greetingMessage: ''})
    this.setState({tutorialExplain: ''})
    this.setState({redMsg: ''})
    this.setState({greenMsg: ''})
}

function changeStyleToHash(json) {
    hash_str = json.replace(/", "/g,'"=>"').replace(/\]\[/g,', ').replace(/\[/,'{').replace(/\]/,'}');
    return hash_str;
}

function clearForm(){
    React.findDOMNode(this.refs.command).value = '';
}

function showResult(res) {
    var lastcmd = '> '+window.sessionStorage.getItem(['lastcmd'])

    //value = this.state.result +'<br><br>'+ lastcmd + '<br>' + res;
    //value = '+ lastcmd + '<br>' + res;

    //this.setState({result: value})
    return lastcmd + res;
}

function refactorStatResult(res) {
    res_lines = '';
    for(var i in res){
        res_lines += (i +" "+ res[i]+"<br>");
    }
    return res_lines;
}

function heardoc() {
    var heredoc = (function () {/*
 _ _ _       _  _                          _    _           _____  _____  __ __    _____  _____  _____  _____ 
| | | | ___ | || | ___  ___  _____  ___   | |_ | |_  ___   |_   _|| __  ||  |  |  | __  ||     ||     ||  _  |
| | | || -_|| || ||  _|| . ||     || -_|  |  _||   || -_|    | |  |    -||_   _|  |    -||  |  || | | ||     |
|_____||___||_||_||___||___||_|_|_||___|  |_|  |_|_||___|    |_|  |__|__|  |_|    |__|__||_____||_|_|_||__|__|
    */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    return heredoc;
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
            var res = sendAjax.bind(this)('DELETE', { command: firstCmd, confirmation: secondCmd });
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

function getExplain(cmd) {
    var explain = '';
    switch (true) {
        case /^stats$/.test(cmd) :
            explain = "Firstly Let's check ROMA's cluster status.<br>[stats] command will display all of cluster status.<br>So please input below command and push Enter key.<br><br>> stats"
            break;
        case /^stats node$/.test(cmd) :
            explain = "[stats] command display the all of parameters, so it is hard to check specific one.<br>But you can use regular expression as a argument.<br>So please input below command and push Enter key.<br><br>> stats node"
            break;
        case /^nodelist$/.test(cmd) :
            explain = "Next let's check current nodelist without using stats command.<br>ROMA has the command which check the just alive nodelist. <br>So please input below command and push Enter key.<br><br>> nodelist"
            break;

        case /^set foo 0 0 3$/.test(cmd) :
            explain = 'todo';
            //explain = "Next is a data store command.<br>[set] command store the data.<br>Usage:<br>set <key> <flags> <exptime> <bytes><br><value><br><br>So please input below command and push Enter key.<br><br>> set foo 0 0 3"
            break;
        case /^get foo$/.test(cmd) :
            explain = "Next is a data getting command.<br>[get] command search and display the data.<br>Usage:<br>get <key><br>So please input below command and push Enter key.<br><br>> get foo"
            break;
        case /^delete foo$/.test(cmd) :
            explain = "Next is a data deletion command.<br>[delete] command remove the data.<br>Usage:<br>delete <key><br>So please input below command and push Enter key.<br><br>> delete foo"
            break;
        case /^add baz 0 0 4$/.test(cmd) :
            //todo
            explain = 'hogehoge';
            //explain = "Let's confirm whether data(of key name is foo) was removed correctly or Not.<br>So please input below command and push Enter key.<br><br>> get foo"
            break;
        case /^get baz$/.test(cmd) :
            explain = "Let's confirm the stored data(of key name is baz).<br>So please input below command and push Enter key.<br><br>> get baz"
            break;
        case /^set_expt baz 1$/.test(cmd) :
            explain = "ROMA can set expired time.<br>When passed over expired time, data will be remove automatically.<br>Usage:<br>set_expt <key> <exptime><br>Setting rule is same of memcached.<br>If the value is 0 then the data will not be expired.<br>So please input below command and push Enter key.<br><br>> set_expt baz 1"
            break;

        case /^release$/.test(cmd) :
            explain = "<br>So please input below command and push Enter key.<br><br>> release"
            break;
    }
    return explain;
}



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
//    $('#console-screen').animate({'margin-left':'220px', 'margin-right':'20px'}, 500);
//    $('#side-bar').css({'visibility':'visible'});
//    window.sessionStorage.setItem(['tutorialFlag'],true);
//    $('#side-bar > ul > li:nth-of-type(1)').css({'color':'red'});
//    $tutorialCommands = [
//        'stats', 
//        'stats node', 
//        'nodelist', 
//        'set foo 0 0 3',
//        'bar', 
//        'get foo',
//        'delete foo',
//        'add baz 0 0 3',
//        'baz',
//        'get baz',
//        'set_expt baz 1',
//        'get baz',
//        'release',
//        'stat primary|secondary',
//        'shutdown_self',
//        'shutdown_self',
//        'recover',
//        'stat short',
//        'set_auto_recover'
//    ]
//
///*
//    React.findDOMNode(this.refs.command).placeholder = nextCommand;
//    
//    this.setState({tutorialExplain: "This mode is tutorial of ROMA basic usage.<br>This mode explain ROMA command one by one.<br>Let's start tutorial, Please push Enter Key "});
//*/
//}
//
//function checkTutorialMode() {
//    if (window.sessionStorage.getItem(['tutorialFlag'])) {
//        return true;
//    } else {
//        return false;
//    }
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
            //this.setState({result: value})
            //var res = '> '+window.sessionStorage.getItem(['lastcmd']);
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
            //var res = '> '+window.sessionStorage.getItem(['lastcmd']);

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



            //clearHeader.bind(this)();

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


/*
 *  =========================================
 *    React Component
 *  =========================================
 *     
*/

//5(parent)
var Console = React.createClass(
    {
        getDefaultProps() {
            return {
                ENTER: 13,
            };
        },
        getInitialState() {
            return {
                res: "",
                downNodeMsg: "",
                aliveNodeMsg: "",
                nodeList: ['localhost_10001', 'localhost_10002', 'localhost_10003', 'localhost_10004', 'localhost_10005'],
            };
        },
        sendCommand(e) {
            if(e.keyCode == this.props.ENTER){
                var response = sendPureCommand.bind(this)(e.target.value);
                this.setState({res: response});
            } 
        },
        render: function() {
            var nodeMsg = {
                nonActive: this.state.downNodeMsg,
                active: this.state.aliveNodeMsg,
            };
            return (
              <div id="console-screen">

                <Header  nodeMsg={nodeMsg}/>
                <Display response={this.state.res}/>

                <div id='inputArea'>
                  <p className='no-margin'>&gt; <input id='inputBox' type="text" placeholder='please input command' onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
              </div>
            );
        }
    }
);


//4(child)
var Display = React.createClass(
    {
        getInitialState() {
            return {
                result: "",
                response: '',
            };
        },
        componentWillReceiveProps(nextProps) {
            this.setState({response: this.state.response + '<br>' + nextProps.response});
        },
        render: function() {
            function lines(line){
                if (line) {
                    return (<p className='no-margin'>{line}</p>);
                } else {
                    return (<p className='no-margin'>&nbsp;</p>);
                }
            }
            return (
                <div id="responseArea">
                  {this.state.response.split('<br>').map(lines)}
                </div>
            );
        }
    }
);

//8(child)
var Header = React.createClass(
    {
        getDefaultProps() {
            return {
                greetingAA: heardoc(),
                greetingMessage: 'Please feel free to execute ROMA command!!',
            };
        },
        getInitialState() {
            return {
                greetingAA: this.props.greetingAA,
                greetingMessage: this.props.greetingMessage,

                tutorialExplain: '',

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
                tutorial: {
                    fontSize: '25px',
                },
            };
            function lines(line){
                if (line) {
                    return (<p className='no-margin'>{line}</p>);
                } else {
                    return (<p className='no-margin'>&nbsp;</p>);
                }
            }
            return (
                <div>
                  <div style={style.greeting}>
                    <div style={style.greetingAA}>{this.state.greetingAA}</div>
                    <div style={style.greetingMsg}>{this.state.greetingMessage}</div>
                    <div style={style.tutorial}>{this.state.tutorialExplain.split('<br>').map(lines)}</div>
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


//1
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

//3
var SelectModeButton = React.createClass(
    {
        selectMode(e) {
          if (e.target.name == 'tutorial') {
            $("#tutorial-button").prop("disabled", true);
            $("#free-button").hide('slow', function(){$("#free-button").remove();});
            startTutorial.bind(this)();
          } else if (e.target.name == 'free') {
            $("#free-button").prop("disabled", true);
            $("#tutorial-button").hide('slow', function(){$("#tutorial-button").remove();});
          }
        },
        render: function() {
            return (
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

                  <TutorialSideBar />

                  <Console />

                  <FooterInfo />
                </div>
            );
        }
    }
);

React.render(<TryRoma />, document.getElementById("reactArea"));

