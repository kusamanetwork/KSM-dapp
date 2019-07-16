import { decodeAddress } from '@polkadot/keyring';
import * as pUtil from '@polkadot/util';
import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faThumbsUp, faUnlink } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';

import InfoBox from './components/Info';
import Manual from './components/Manual';

import Kusama from './assets/kusama_word.png';

import Claims from './build/contracts/Claims.json';
import FrozenToken from './build/contracts/FrozenToken.json';

// #BC0066 - Hot Pink

const Navbar = styled.div`
  width: 100vw;
  height: 60px;
  background: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  color: white;
  z-index: 100;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: black;
  height: 100%;
  width: 120px;
  color: white;
  :hover {
    cursor: pointer;
    background: white;
    color: black;
  }
`;

const Main = styled.div`
  width: 100%;
  padding: 3%;
  display: flex;
  flex-direction: row-wrap;
  padding-top: 0;
  margin-top: 1%;
  @media (max-width: 750px) {
    flex-direction: column;
    padding: 0;
    justify-content: center;
    align-items: center;
  }
`;

const MainLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-right: 1%;
  background: rgba(255,255,255,1.0);
  border-radius: 12px;
  padding: 2%;
  @media (max-width: 750px) {
    width: 90%;
    margin-bottom: 3%;
  }
`;

const MainRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-left: 1%;
  background: white;
  border-radius: 12px;
  padding: 2%;
  padding-top: 0;
  @media (max-width: 750px) {
    width: 90%;
    margin-bottom: 3%;
    margin-top: -1%;
  }
`;

const Spacer = styled.div`
  width: 100%;
  height: 60px;
  background: transparent;
`;

const SucceedIcon = styled(FontAwesomeIcon)`
  color: ${props => Boolean(props.status) ? 'green' : 'red'};
`;

const MyInput = styled.input`
  width: ${props => props.width}px !important;
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 2px;
  padding-left: 3px;
  font-size: 13px;
  margin-bottom: 16px;
  @media (max-width: 750px) {
    width: 90% !important;
  }
`;

const MySelect = styled.select`
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 1px;
  padding-left: 2px;
  background: white;
`;

const MyLink = styled(Link)`
  width: 120px;
  height: 100%;
`;

const MyButton = styled.button`
  border-color: black;
  border-radius: 10px;
  border-width: 2px;
  padding: 10px;
  background: white;
  :hover {
    background: black;
    color: white;
    cursor: pointer;
  }
`;

const TextareaButton = styled.button`
  margin-top: -35px;
  margin-left: 90%;
  position: absolute;
  background: black;
  color: white;
  border-color: black;
  :hover {
    cursor: pointer;
  }
  @media (max-width: 750px) {
    margin-lefT: 80%;
  }
`;

const DisabledText = styled.div`
  background: #EBEBE4;
  font-size: 12px;
  color: #545454;
  border-style: solid;
  border-color: silver;
  border-width: 0.25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 25px;
  overflow-x: hidden;
  position: relative;
`;

const DisabledButton = styled.button`
  position: absolute;
  right: 0;
`;


class App extends React.Component {

  state = {
    claims: null,
    correctAmendment: null,
    defaultAccount: null,
    frozenToken: null,
    metamask: false,
    myCrypto: false,
    pubKey: null,
    showAmend: false,
    status: null,
    web3: null,
  }

  componentDidMount = async () => {
    window.addEventListener('load', async () => {
      let w3, account;
      if (typeof window.web3 !== 'undefined') {
        w3 = new Web3(window.web3.currentProvider);
        account = (await w3.eth.getAccounts())[0];
      } else {
        console.log('No web3? You should consider trying MetaMask!')
        w3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }

      this.setState({
        defaultAccount: account,
        web3: w3,
      });
    })
  }

  initializeContracts = async (web3) => {
    const netId = await web3.eth.net.getId();

    const frozenToken = new web3.eth.Contract(FrozenToken.abi, FrozenToken.networks[netId.toString()].address);
    const claims = new web3.eth.Contract(Claims.abi, Claims.networks[netId.toString()].address);
  
    this.setState({
      claims,
      frozenToken,
    });
  }

  inputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'valid-check') {
      if (value.length === 48) {
        const pubKey = pUtil.u8aToHex(decodeAddress(value));
        console.log(pubKey);

        this.setState({
          pubKey,
          status: 'true',
        })
      } else {
        if (this.state.status === 'true') {
          this.setState({
            status: null,
          })
        }
      }
    }

    this.setState({
      [name]: value,
    });
  }

  handleSelect = (e) => {
    const { value } = e.target;
    if (value === 'MyCrypto') {
      this.setState({
        metamask: false,
        myCrypto: true,
      });
    } else {
      this.setState({
        metamask: true,
        myCrypto: false,
      });
    }
  }

  tryClaim = async () => {
    if (!Boolean(this.state.status)) {
      return;
    }
    if (!this.state.claims) {
      return;
    }

    const { claims, defaultAccount } = this.state;

    let eth;
    if (Boolean(this.state.correctAmendment)) {
      eth = this.state.amendedAddress;
    } else {
      eth = defaultAccount;
    }

    const decoded = pUtil.u8aToHex(decodeAddress(this.state['valid-check']));

    const txResult = await claims.methods.claim(eth, decoded).send({
      from: defaultAccount,
      gas: 1500000,
      gasPrice: 20000,
    });

    console.group(txResult);
  }

  validateAmend = async (e) => {
    const { value } = e.target;
    if (!this.state.claims) {
      return;
    }

    const { claims, defaultAccount } = this.state;

    const amend = await claims.methods.amended(value).call();

    if (amend === defaultAccount) {
      this.setState({
        correctAmendment: 'true',
        amendedAddress: value,
      })
    }
  }

  render() {
    if (this.state.web3 !== null) {
      this.initializeContracts(this.state.web3);
    }

    return (
      <Router>
      <div>
        <Navbar>
          <img src={Kusama} width='120px' height='20px'/>
        </Navbar>
        <Spacer/>
        <Route
          path='/'
          render={() => (
            <>
              <Main>
                <MainLeft>
                  <h1>Claim KSM</h1>
                  <h2>Coming soon: 17 July, 4:00PM UTC</h2>
                  <br/>
                  <p>This DApp will walk you through the process of claiming KSM. In order to claim KSM you need to have an allocation of DOTs.</p>
                  <h2>Create a Kusama address</h2>
                  <br/>
                  <p>You will first need to create an account. This is the account that you will be claiming your KSM to, so make sure to extra precautions to keep it secure. For some tips on keeping your key safe, <a href='#'>see here</a>. Create an account using one of the following methods:</p>
                  <ul>
                    <li><a href="https://polkadot.js.org/apps/#/accounts" target="_blank">Polkadot UI</a> <b>(Recommended for most users)</b></li>
                    <li><code><a href="#">subkey</a></code> <b>(Most secure)</b></li>
                    <li><a href="https://chrome.google.com/webstore/detail/enzyme/amligljifngdnodkebecdijmhnhojohh" target="_blank">Enzyme wallet</a> <b>(Chrome only)</b></li>
                    <li><a href="https://polkawallet.io/#download" target="_blank">Polkawallet</a></li>
                  </ul>
                  <br/>
                  <a href="https://github.com/kusamanetwork/KSM-dapp/blob/master/src/docs/claiming.md">See full step-by-step instructions.</a><br/>
                  <a href="https://riot.im/app/#/room/#KSMAClaims:polkadot.builders">Need help? Join the Claims Support chat.</a>

                </MainLeft>
                <MainRight>
                <h4>How will you claim?</h4>
                <MySelect onChange={this.handleSelect} defaultValue="">
                  <option value="" disabled hidden>Choose your method to claim</option>
                  <option value="MyCrypto" disabled>On Ethereum (before genesis)</option>
                  <option value="On-chain" disabled>On Kusama (after genesis)</option>
                </MySelect>
                {
                  this.state.myCrypto &&
                    <div>
                      <h4>Claims contract:</h4>
                      <DisabledText>
                        0xA7b099b5aA4F6d8209e6b58c0d5909D8ae1c00E7
                        <CopyToClipboard text="0xA7b099b5aA4F6d8209e6b58c0d5909D8ae1c00E7">
                          <DisabledButton>
                            <FontAwesomeIcon icon={faClipboard}/>
                          </DisabledButton>
                        </CopyToClipboard>
                      </DisabledText>
                      <h4>ABI:</h4>
                      <div style={{ position: 'relative' }}>
                        <textarea style={{width: '100%', height: '100px', resize: 'none'}} disabled>{JSON.stringify(Claims.abi)}</textarea>
                        <CopyToClipboard text={JSON.stringify(Claims.abi)}>
                          <TextareaButton>copy</TextareaButton>
                        </CopyToClipboard>
                      </div>
                      <h4>What is your Kusama address?</h4>
                      <div>
                        <MyInput
                          width='450'
                          name='valid-check'
                          onChange={this.inputChange}
                        />
                        {' '}<SucceedIcon icon={Boolean(this.state.status) ? faThumbsUp : faUnlink} status={this.state.status}/>
                      </div>
                      <p>Public Key:</p>
                      <DisabledText>
                        {this.state.pubKey || ''}
                        <CopyToClipboard text={this.state.pubKey || ''}>
                          <DisabledButton>
                            <FontAwesomeIcon icon={faClipboard}/>
                          </DisabledButton>
                        </CopyToClipboard>
                      </DisabledText>
                    </div>
                }
                </MainRight>
              </Main>
              <InfoBox claims={this.state.claims || null} frozenToken={this.state.frozenToken || null} />
            </>
          )}/>
      </div>
      </Router>
    );
  }
}

export default App;
