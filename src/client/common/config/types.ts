import { Uri } from 'vscode';
import { IPythonSettings } from '../configSettings';

export const IConfigurationService = Symbol('IConfigurationService');

export interface IConfigurationService {
    getConfiguration(resource?: Uri): IPythonSettings;
}