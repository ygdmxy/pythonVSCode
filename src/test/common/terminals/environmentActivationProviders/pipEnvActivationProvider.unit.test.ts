// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as assert from 'assert';
import { instance, mock, when } from 'ts-mockito';
import { Uri } from 'vscode';
import { PipEnvActivationCommandProvider } from '../../../../client/common/terminal/environmentActivationProviders/pipEnvActivationProvider';
import { ITerminalActivationCommandProvider, TerminalShellType } from '../../../../client/common/terminal/types';
import { getNamesAndValues } from '../../../../client/common/utils/enum';
import { IInterpreterService, InterpreterType } from '../../../../client/interpreter/contracts';
import { InterpreterService } from '../../../../client/interpreter/interpreterService';

// tslint:disable:no-any

suite('Terminals Activation - PipEnv', () => {
    [undefined, Uri.parse('x')].forEach(resource => {
        suite(resource ? 'With a resource' : 'Without a resource', () => {
            let activationProvider: ITerminalActivationCommandProvider;
            let interpreterService: IInterpreterService;
            setup(() => {
                interpreterService = mock(InterpreterService);
                activationProvider = new PipEnvActivationCommandProvider(instance(interpreterService));
            });

            test('No commands for no interpreter', async () => {
                when(interpreterService.getActiveInterpreter(resource)).thenResolve();

                for (const shell of getNamesAndValues<TerminalShellType>(TerminalShellType)) {
                    const cmd = await activationProvider.getActivationCommands(resource, shell.value);

                    assert.equal(cmd, undefined);
                }
            });
            test('No commands for an interpreter that is not pipEnv', async () => {
                const nonPipInterpreterTypes = getNamesAndValues<InterpreterType>(InterpreterType)
                    .filter(t => t.value !== InterpreterType.PipEnv);
                for (const interpreterType of nonPipInterpreterTypes) {
                    when(interpreterService.getActiveInterpreter(resource)).thenResolve({ type: interpreterType } as any);

                    for (const shell of getNamesAndValues<TerminalShellType>(TerminalShellType)) {
                        const cmd = await activationProvider.getActivationCommands(resource, shell.value);

                        assert.equal(cmd, undefined);
                    }
                }
            });
            test('pipenv shell is returned for pipenv interpeter', async () => {
                when(interpreterService.getActiveInterpreter(resource)).thenResolve({ type: InterpreterType.PipEnv } as any);

                for (const shell of getNamesAndValues<TerminalShellType>(TerminalShellType)) {
                    const cmd = await activationProvider.getActivationCommands(resource, shell.value);

                    assert.deepEqual(cmd, ['pipenv shell']);
                }
            });
        });
    });
});