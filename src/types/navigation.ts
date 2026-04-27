import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Inicio: undefined;
  FH: undefined;
  Planificacion: undefined;
  Mensajes: undefined;
  Cuenta: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  PersonalData: undefined;
  ShiftHistory: undefined;
  VacationRequest: undefined;
  HoursReport: undefined;
  Session: undefined;
};
