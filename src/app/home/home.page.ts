import { Component, OnInit } from '@angular/core';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  serviceUUID = "2A19";
  inferUUID = "2A20";
  labelUUID = "2A21";
  deviceID: string = "";
  isDeviceConnected: boolean = false;
  isModalOpen: boolean = false;
  isEnabled: boolean = false;
  inferResult: string = "Prueba";

  constructor(
    private bleService: BLE,
    private alertController: AlertController
  ) { };

  async ngOnInit() {
    await this.verifyBluetooth();
    await this.startDeviceScanning();
  }

  createAlert(message: string) {
    return this.alertController.create({ message });
  };

  string2ab(str: string) {
    const buf = new ArrayBuffer(str.length * 2);
    const bufView = new Uint16Array(buf);
    for (var i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  ab2string(buffer: ArrayBuffer) {
    const bitsToTranslate = new Uint8Array(buffer);
    let message = "";
    for (var i = 0; i < bitsToTranslate.length; i++) {
      message += String.fromCharCode(bitsToTranslate[i]);
    }
    return message;
  }

  connect() {
    const connectedCb = () => {
      this.isDeviceConnected = true;
      console.log("Dispositivo conectado.");
    };

    const disconnectedCb = () => {
      this.isDeviceConnected = false;
      console.log("Dispositivo desconectado");
    }
    
    this.bleService.autoConnect(this.deviceID, connectedCb, disconnectedCb);
  }

  async readResponse() {
    const bleResponse = await this.bleService.read(this.deviceID, this.serviceUUID, this.labelUUID);
    const typedData = bleResponse as ArrayBuffer;
    console.log("DATA OBTENIDA:", typedData);
    const strInferred = this.ab2string(typedData);
    console.log("Respuesta leída:", strInferred);
    if (strInferred) this.inferResult = strInferred;
  }

  async sendInferRequest() {
    await this.bleService.write(
      this.deviceID,
      this.serviceUUID,
      this.inferUUID,
      new ArrayBuffer(1)
    ).then(() => this.readResponse())
      .catch(() => console.log("Error enviando el comando de inferencia."));
  }

  async disconnect() {
    await this.bleService.disconnect(this.deviceID);
  }

  async startDeviceScanning() {
    if (this.isEnabled) {
      console.log("Iniciando escaneo...");
      this.bleService.startScan([this.serviceUUID]).subscribe(device => {
        const deviceSimplification = { name: device.name ? device.name : '', id: device.id };
        this.deviceID = deviceSimplification.id;
        this.bleService.stopScan();
      });
    }
  };

  async verifyBluetooth() {
    return await this.bleService.isEnabled().then(async () => {
      const successMessage = await this.createAlert('✅ Su bluetooth esta encendido.');
      this.isEnabled = true;
      successMessage.present();
      return true;
    }, async () => {
      const errorMessage = await this.createAlert('❌ Encienda su bluetooth y reinicie la aplicación.');
      errorMessage.present();
      return false;
    })
  };

}
