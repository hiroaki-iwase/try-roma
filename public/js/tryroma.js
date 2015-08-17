/*
 *  =========================================
 *    JavaScript
 *  =========================================
 *     
*/
function clearHeader(){
    this.setState({greetingAA: ''})
    this.setState({greetingMessage: ''})
    this.setState({nonActiveNodeMsg: ''})
    this.setState({activeNodeMsg: ''})
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

    value = this.state.result +'<br><br>'+ lastcmd + '<br>' + res;

    this.setState({result: value})
}

function refactorStatResult(res) {
    res_lines = '';
    for(var i in res){
        res_lines += (i +" "+ res[i]+"<br>");
    }
    return res_lines;
}

function sendQuery(action, data, url, format) {
    var path = url || '';
    $.ajax({
        url: "../"+path,
        type: action,
        data: data,
        dataType: format,
        cache: false,
    }).done(function(res){
        clearForm.bind(this)();
        if (action == 'PUT') {
          res = changeStyleToHash(res);
        } 
        if (format == 'json') {
            res = refactorStatResult(res);
        }
        showResult.bind(this)(res);
    }.bind(this)).fail(function(){
        this.setState({result: 'API Request was failed '})
    }.bind(this));
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


function displayNodeDownMsg(cmd){

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

    this.setState({nonActiveNodeMsg: nonActiveMessage})
    this.setState({activeNodeMsg: activeMessage})
}

function checkSecondValue(e) {
    var lastcmd = window.sessionStorage.getItem(['lastcmd']);

    switch (true) {
        case /^(balse|shutdown|shutdown_self)$/.test(lastcmd):
            sendQuery.bind(this)('DELETE', { command: lastcmd, confirmation: e.target.value });

            if (e.target.value == 'yes') {
                 this.setState({result: ''});
                 displayNodeDownMsg.bind(this)(lastcmd);
            }

            break;

        case /^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(lastcmd) :
            sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, value: e.target.value });
            break;

        case /^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(lastcmd) :
            sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3, bytes: RegExp.$4, casid: RegExp.$5, value: e.target.value});
            break;

    }
    
    window.sessionStorage.removeItem(['requireNext']);
    window.sessionStorage.setItem(['lastcmd'],[e.target.value]);

}

function analyzeCommand(e) {
    var ENTER = 13;
    if(e.keyCode == ENTER){

        clearHeader.bind(this)();

        if (window.sessionStorage.getItem(['requireNext'])) {
            checkSecondValue.bind(this)(e);
        } else {
            window.sessionStorage.setItem(['lastcmd'],[e.target.value]);
            switch (true) {
                // GET =========================================================================
                case /^(stats|stat)(\s(.*))*$/.test(e.target.value) :
                    sendQuery.bind(this)('GET', null, RegExp.$1+"/"+RegExp.$3, 'json');
                    break;

                case /^(whoami|nodelist|version)$/.test(e.target.value) :
                    console.log(this.state.nodeList);
                    sendQuery.bind(this)('GET', null, RegExp.$1 );
                    break;
                case /^(get|gets)\s(.+)$/.test(e.target.value) :
                    sendQuery.bind(this)('GET', null, RegExp.$1+"/"+RegExp.$2 );
                    break;

                // DELETE =========================================================================
                case /^(balse|shutdown|shutdown_self|rbalse)$/.test(e.target.value) :
                    var cmd = RegExp.$1;
                    //sendQuery.bind(this)('DELETE', { command: RegExp.$1, confirmation: RegExp.$2 });
                    sendQuery.bind(this)('DELETE', { command: RegExp.$1, confirmation: null });
                    
                    // require next line(yes/no)!!
                    if (/^(balse|shutdown|shutdown_self)$/.test(cmd)) {
                        window.sessionStorage.setItem(['requireNext'],[true]);
                    }
                    break;

                // POST =========================================================================
                case /^(set|add|replace|append|prepend)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)$/.test(e.target.value) :
                    window.sessionStorage.setItem(['requireNext'],[true]);
                    break;

                case /^(set_expt)\s([a-z0-9]+)\s([0-9]+)$/.test(e.target.value) :
                    sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, exptime: RegExp.$3 });
                    break;

                case /^(cas)\s([a-z0-9]+)\s0\s([0-9]+)\s([0-9]+)\s([0-9]+)$/.test(e.target.value) :
                    window.sessionStorage.setItem(['requireNext'],[true]);
                    break;

                case /^(incr|decr)\s([a-z0-9]+)\s([-]*[0-9]+)$/.test(e.target.value) :
                    sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2, digit: RegExp.$3 });
                    break;

                case /^(delete)\s([a-z0-9]+)$/.test(e.target.value) :
                    sendQuery.bind(this)('POST', { command: RegExp.$1, key: RegExp.$2 });
                    break;


                // PUT =========================================================================
                case /^(release|recover)$/.test(e.target.value) :
                    sendQuery.bind(this)('PUT', {command: RegExp.$1});
                    break;

                case /^(set_lost_action|set_log_level)\s(.+)$/.test(e.target.value) :
                    sendQuery.bind(this)('PUT', {command: RegExp.$1, level: RegExp.$2, lost: RegExp.$2});
                    break;

                case /^(set_auto_recover)\s([a-z]+)\s*([0-9]*)$/.test(e.target.value) :
                    sendQuery.bind(this)('PUT', {command: RegExp.$1, bool: RegExp.$2, sec: RegExp.$3});
                    break;

                case /^(set_log_level)\s([a-z]+)$/.test(e.target.value) :
                    sendQuery.bind(this)('PUT', {command: RegExp.$1, level: RegExp.$2});
                    break;

                //// Same Command Again=========================================================================
                //case '!!':
                //    this.setState({cmd: "please input command"});
                //        this.setState({result: ''});
                //    break;

                // No Command =========================================================================
                case e.target.value == '':
                    var lastcmd = '> ';
                    this.setState({result: this.state.result +'<br>'+lastcmd});
                    //this.setState({result: this.state.result +'<br>'+lastcmd});
                    break;

                // Not supported yet on virtual console =========================================================================
                default:
                    console.log(e.target.value.size);
                    var res = 'Not Supported';
                    showResult.bind(this)(res);
                    clearForm.bind(this)();
                    break;
            }
        }
 
        if (window.sessionStorage.getItem(['tutorialFlag'])) {
           showTutorialMessage.bind(this)(e.target.value);
            
        } 
    }
}



function showTutorialMessage(cmd) {
    if (cmd == window.sessionStorage.getItem(['nextCommand'])) {

    } else {

    }

    

    window.sessionStorage.setItem(['nextCommand'],'stats');
    window.sessionStorage.setItem(['tutorialFlag'],true);

}

function startTutorial() {
    console.log('enter startTutorial');
    $('#console-screen').animate({'margin-left':'220px', 'margin-right':'20px'}, 500);
    $('#side-bar').css({'visibility':'visible'});
    window.sessionStorage.setItem(['tutorialFlag'],true);
    window.sessionStorage.setItem(['nextCommand'],'stats');
    $('#side-bar > ul > li:nth-of-type(1)').css({'color':'red'});
}


/*
 *  =========================================
 *    React Component
 *  =========================================
 *     
*/

var Console = React.createClass(
    {
        getInitialState() {
            return {
                greetingAA: heardoc(),
                greetingMessage: 'Please feel free to execute ROMA command!!',
                nonActiveNodeMsg: '',
                activeNodeMsg: '',
                nodeList: ['localhost_10001', 'localhost_10002', 'localhost_10003', 'localhost_10004', 'localhost_10005'],
                result: "",
            };
        },
        sendCommand(e) {
            analyzeCommand.bind(this)(e);

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
              <div id="console-screen">
                <div id="header-area">
                  <div id="greeting">
                    <div id="greeting-aa">{this.state.greetingAA}</div>
                    <div id="greeting-msg">{this.state.greetingMessage}</div>
                  </div>
                  <div>
                    <div id="non-active-nodeinfo">{this.state.nonActiveNodeMsg.split('<br>').map(lines)}</div>
                    <div id="active-nodeinfo">{this.state.activeNodeMsg.split('<br>').map(lines)}</div>
                  </div>
                </div>
                <div id="resultArea">
                  {this.state.result.split('<br>').map(lines)}
                </div>
                <div id='inputArea'>
                  <p className='no-margin'>&gt; <input id='inputBox' type="text" placeholder='please input command' onChange={this.changeText} onKeyDown={this.sendCommand} ref="command" autoFocus={focus} /></p>
                </div>
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

var SelectMode = React.createClass(
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
                  <SelectMode />
                  <TutorialSideBar />
                  <Console />
                  <FooterInfo />
                </div>
            );
        }
    }
);

React.render(<TryRoma />, document.getElementById("reactArea"));

