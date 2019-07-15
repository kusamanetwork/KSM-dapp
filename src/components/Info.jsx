import { encodeAddress } from '@polkadot/keyring';
import * as pUtil from '@polkadot/util';
import React from 'react';
import styled from 'styled-components';

const MainBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin-left: 3%;
  margin-top: -1%;
  margin-bottom: 3%;
  background: white;
  border-radius: 12px;
  padding: 2%;
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
`;

class InfoBox extends React.Component {

  state = {
    balData: null,
  }


  balanceCheck = async (e) => {
    const { value } = e.target;

    if (value.length !== 42) {
      // Better ethereum address validity check.
      console.log(value);
      return;
    }
    if (!this.props.frozenToken || !this.props.claims) {
      return;
    }

    const bal = await this.props.frozenToken.methods.balanceOf(value).call();
    const claimData = await this.props.claims.methods.claims(value).call();
    const { pubKey, index } = claimData;
    let pAddress;
    if (pubKey !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      pAddress = encodeAddress(pUtil.hexToU8a(pubKey));
    }
    
    this.setState({
      balData: {
        bal,
        index: index || null,
        pubKey: pAddress || null,
      }
    });
  }

  render() {
    return (
      <MainBottom>
        <h2>Check your information:</h2>
        <h4>Paste address to your DOT allocation below to check your Kusama address, index and balance:</h4>
        <MyInput
          width='500'
          name='balance-check'
          onChange={this.balanceCheck}
        />
        <p><b>Address:</b> {(this.state.balData && this.state.balData.pubKey) ? this.state.balData.pubKey : 'None'}</p>
        <p><b>Index:</b> {(this.state.balData && this.state.balData.pubKey) ? this.state.balData.index : 'None'}</p> 
        <p><b>Balance:</b> {this.state.balData ? this.state.balData.bal : '0'} KSMA</p>
      </MainBottom>
    );
  }
}

export default InfoBox;
