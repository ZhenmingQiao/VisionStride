#include <Servo.h>  //调用舵机库
#include <IRremote.hpp>

Servo myservoLeft, myservoRight;
int leftVal = 0;
int rightVal = 0;
bool isActive = false;
float turnTime = 0;
bool isTurn = false;

void setup() {
  // Serial.begin(9600);

  // while (!Serial)
  //   ;

  myservoLeft.attach(7);   // 左侧舵机
  myservoRight.attach(8);  // 右侧舵机

  IrReceiver.begin(11, ENABLE_LED_FEEDBACK);
  // printActiveIRProtocols(&Serial);
}

void loop() {

  if (IrReceiver.decode()) {

    if (IrReceiver.decodedIRData.protocol == UNKNOWN) {
      IrReceiver.resume();
    } else {
      IrReceiver.resume();
      IrReceiver.printIRResultShort(&Serial);
    }

    int command = IrReceiver.decodedIRData.command;
    // Serial.print("ir:");
    // Serial.print(command);
    // Serial.println();

    if (!isActive) {
      if (command == 90) {  // 左
        leftVal = 2;
      } else if (command == 8) {  // 右
        rightVal = 2;
      } else if (command == 24) {  // 下
        leftVal = 2;
        rightVal = 2;
      } else if (command == 82) {  // 上
        leftVal = 5;
        rightVal = 5;
      }
      isActive = true;
    }
  }

  if (isActive && millis() - turnTime > 300) {
    if (isTurn) {
      myservoLeft.write(0);
      myservoRight.write(0);
      isTurn = false;

      if (leftVal == 0 && rightVal == 0) {
        isActive = false;
      }
    } else {
      if (leftVal > 0) {
        myservoLeft.write(125);
        leftVal--;
      }
      if (rightVal > 0) {
        myservoRight.write(125);
        rightVal--;
      }
      isTurn = true;
    }

    turnTime = millis();

  }
}
