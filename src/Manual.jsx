import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

import Security from './docs/security.md';

const Container = styled.div`
  height: 100%;
  width: 100%;  
  display: flex;
  flex-direction: row;
`;

const Main = styled.div`
  color: white;
  background: transparent;
  margin: 0;
  width: calc(100vw - 200px);
`;

const Sidebar = styled.div`
  height: calc(100vh - 60px);
  width: 200px;
  display: flex;
  flex-direction: column;
`;

const SidebarButton = styled.button`
  height: 30px;
  background: transparent;
  color: white;
  border: none;
  :hover {
    background: white;
    color: black;
    cursor: pointer;
  }
`;

class Manual extends React.Component {

  state = {
    security: null,
  }

  componentWillMount = () => {
    fetch(Security).then((res) => res.text()).then((text) => {
      this.setState({
        security: text,
      })
    })
  }

  render() {
    return (
      <Container>
        <Sidebar>
          <SidebarButton>Overview</SidebarButton>
          <SidebarButton>Reward Mechanism</SidebarButton>
          <SidebarButton>Governance</SidebarButton>
          <SidebarButton>Validators</SidebarButton>
          <SidebarButton>Critical Issues / Bugs</SidebarButton>
        </Sidebar>
        <Main>
          <ReactMarkdown source={this.state.security}/>
        </Main>
      </Container>
    )
  }
}

export default Manual;
