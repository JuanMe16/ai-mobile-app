import { Component, OnInit } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  deviceUUID: string = "";
  isScanning: boolean = false;
  isDeviceConnected: boolean = false;
  isModalOpen: boolean = false;
  isEnabled: boolean = false;
  step: number = 1;
  devicesList: any[] = [];

  constructor(
    private bleService: BLE,
    private alertController: AlertController
  ) { };

  ngOnInit(): void {
    this.verifyBluetooth();
  }

  async setOpenModal(value: boolean) {
    if (value && !this.isEnabled) {
      await this.verifyBluetooth();
    } else {
      this.isModalOpen = value;
      if (this.isScanning) {
        this.stopDeviceScanning();
      } else {
        this.startDeviceScanning();
      }
    };
  }

  createAlert(message: string) {
    return this.alertController.create({ message });
  };

  handler(value: any) {
    console.log(value);
  }

  connect(address: string) {
    this.bleService.connect(address).subscribe(success => {
      this.isDeviceConnected = true;
      this.deviceUUID = address;
      this.stopDeviceScanning();
      console.log("Conectado a :", success);
    });
  }

  disconnect() {
    this.bleService.disconnect(this.deviceUUID)
    this.isDeviceConnected = false;
    console.log("Dispositivo desconectado");
  }

  startDeviceScanning() {
    this.isScanning = true;
    this.bleService.startScan([]).subscribe(device => {
      console.log("DEVICE ENCONTRADO CAPO", JSON.stringify(device));
      const deviceSimplification = { name: device.name ? device.name : '', id: device.id };
      if (!this.devicesList.includes(deviceSimplification)) {
        this.devicesList.push(deviceSimplification);
      }
    });
  };

  stopDeviceScanning() {
    this.isScanning = false;
    this.isModalOpen = false;
    this.bleService.stopScan();
  }

  async verifyBluetooth() {
    return await this.bleService.isEnabled().then(async () => {
      const successMessage = await this.createAlert('✅ Su bluetooth esta encendido.');
      this.isEnabled = true;
      successMessage.present();
      return true;
    }, async () => {
      const errorMessage = await this.createAlert('❌ Encienda su bluetooth.');
      errorMessage.present();
      return false;
    })
  };

}
