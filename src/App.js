import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import * as pUtil from '@polkadot/util';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faGifts, faUnlink } from '@fortawesome/free-solid-svg-icons';
import Web3 from 'web3';

import Manual from './Manual';

import Kusama from './assets/kusama_word.png';

import Claims from './build/contracts/Claims.json';
import FrozenToken from './build/contracts/FrozenToken.json';

// #BC0066 - Hot Pink

const Navbar = styled.div`
  width: 100%;
  height: 60px;
  background: #000;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  color: white;
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
  background: transparent;
  display: flex;
  flex-direction: row;
  padding-top: 0;
  margin-top: 1%;
`;

const MainLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-right: 1%;
  background: rgba(255,255,255,1.0);
  border-radius: 3px;
  padding: 2%;
  padding-top: 2%;
`;

const MainRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 42%;
  margin-left: 1%;
  background: white;
  border-radius: 3px;
  padding: 2%;
`;

const MainBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin-left: 3%;
  margin-top: -1%;
  margin-bottom: 3%;
  background: white;
  border-radius: 3px;
  padding: 2%;

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
  padding: 1px;
  padding-left: 2px;
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


class App extends React.Component {

  state = {
    balanceData: null,
    claims: null,
    correctAmendment: null,
    defaultAccount: null,
    frozenToken: null,
    metamask: false,
    myCrypto: false,
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
        this.setState({
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

  balanceCheck = async (e) => {
    const { value } = e.target;

    if (value.length !== 42) {
      // Better ethereum address validity check.
      console.log(value);
      return;
    }
    if (!this.state.frozenToken || !this.state.claims) {
      return;
    }

    const bal = await this.state.frozenToken.methods.balanceOf(value).call();
    const claimData = await this.state.claims.methods.claims(value).call();
    const { polkadot, index } = claimData;
    let pAddress;
    if (polkadot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      pAddress = encodeAddress(pUtil.hexToU8a(polkadot));
    }
    
    this.setState({
      balData: {
        bal,
        index: index || null,
        polkadot: pAddress || null,
      }
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
          <MyLink to='#'><NavButton>Home</NavButton></MyLink>
          <MyLink to='/manual'><NavButton>User Manual</NavButton></MyLink>
          <MyLink to='/claims'><NavButton>Claims</NavButton></MyLink>
          <MyLink to='/faucet'><NavButton>Faucet</NavButton></MyLink>
          <NavButton></NavButton>
        </Navbar>
        <Spacer/>
        <Route path='/manual' component={Manual}/>
        <Route
          path='/claims'
          render={() => (
            <>
              <Main>
                <MainLeft>
                  <h1>Claim KSMAs</h1>
                  <p>This DApp will walk you through the process of claiming KSMAs. In order to claim KSMAs you need to have an allocation of DOTs.</p>
                  <h2>Create a Kusama address</h2>
                  <p>You will first need to create an account. This is the account that you will be claiming your KSMAs to, so make sure to extra precautions to keep it secure. For some tips on keeping your key safe, <a href='#'>see here</a>. Create an account using one of the following methods:</p>
                  <ul>
                    <li>Polkadot UI <b>(Recommended for most users)</b></li>
                    <li><code>subkey</code></li>
                    <li>Enzyme wallet</li>
                    <li>Polkawallet</li>
                  </ul>
                  <a href="#">Need help?</a>

                </MainLeft>
                <MainRight>
                <h4>What is your Kusama address?</h4>
                  <div>
                    <MyInput
                      width='300'
                      name='valid-check'
                      onChange={this.inputChange}
                    />
                    {' '}<SucceedIcon icon={Boolean(this.state.status) ? faCoffee : faUnlink} status={this.state.status}/>
                  </div>
                  <br/>
                  <h4>How will you claim?</h4>
                  <MySelect onChange={this.handleSelect} defaultValue="">
                    <option value="" disabled hidden>Choose your method to claim</option>
                    <option value="Metamask">Metamask (before genesis)</option>
                    <option value="MyCrypto">MyCrypto (before genesis)</option>
                    <option value="On-chain" disabled>On-chain (after genesis)</option>
                  </MySelect>
                  {
                    this.state.metamask && 
                      <div>
                        <h3>Metamask</h3>
                        <p>You will send the claim transaction from your currently active Metamask account.</p>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                          <p>Are you claiming for an amended address?</p>
                          <input type='checkbox' onChange={() => this.setState({ showAmend: !this.state.showAmend })}></input>
                        </div>
                        {
                          this.state.showAmend &&
                            <div>
                              <p>Which address is it?</p>
                              <MyInput onChange={this.validateAmend}/>
                              {' '}<SucceedIcon icon={Boolean(this.state.status) ? faCoffee : faUnlink} status={this.state.correctAmendment}/>
                            </div>
                        }
                        <MyButton
                          onClick={this.tryClaim}
                        >Claim</MyButton>
                      </div>
                  }
                  {
                    this.state.myCrypto &&
                      <div>
                        <h3>MyCrypto</h3>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                          <p>Are you claiming for an amended address?</p>
                          <input type='checkbox' onChange={() => this.setState({ showAmend: !this.state.showAmend })}></input>
                        </div>
                        {
                          this.state.showAmend &&
                            <div>
                              <p>Which address is it?</p>
                              <MyInput onChange={this.validateAmend}/>
                              {' '}<SucceedIcon icon={Boolean(this.state.status) ? faCoffee : faUnlink} status={this.state.correctAmendment}/>
                            </div>
                        }
                        <p>Does not require in browser compatibility (send from MyCrypto)</p>
                      </div>
                  }
                </MainRight>
              </Main>
              <MainBottom>
                <h2>Check your information:</h2>
                <h4>Paste address to your DOT allocation below to check your Kusama address, index and balance:</h4>
                <MyInput
                  width='400'
                  name='balance-check'
                  onChange={this.balanceCheck}
                />
                <p><b>Address:</b> {(this.state.balData && this.state.balData.polkadot) ? this.state.balData.polkadot : 'None'}</p>
                <p><b>Index:</b> {(this.state.balData && this.state.balData.polkadot) ? this.state.balData.index : 'None'}</p> 
                <p><b>Balance:</b> {this.state.balData ? this.state.balData.bal : '0'} KSMAs</p>
              </MainBottom>
            </>
          )}/>
      </div>
      </Router>
    );
  }
}

export default App;
