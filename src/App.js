import Card from './Card';

import './App.scss';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Bike Parts Bin
      </header>
      <main>
        <Card part="Frame" name="Canyon Lux CF SLX" purchaseDate="2018" purchasePrice="2000" weight="1650" />
        <Card part="Powermeter" name="Quarq Powermeter" purchaseDate="2018" purchasePrice="750" weight="500" />
        <Card part="Crankarm" name="SRAM XX1" purchaseDate="2018" purchasePrice="500" weight="346" />
        <Card part="Deraillieur" name="SRAM XX1 Eagle AXS" purchaseDate="2019" purchasePrice="2000" weight="120" />
        <Card part="Chain" name="SRAM XP-1950" purchaseDate="2018" purchasePrice="30" weight="50" />
        <Card part="Trigger" name="SRAM XX1 AXS Trigger" purchaseDate="2019" purchasePrice="80" weight="45" />
        <Card part="Handlebar" name="Darimo MTB bar" purchaseDate="2020" purchasePrice="300" weight="80" />
      </main>
    </div>
  );
}

export default App;
