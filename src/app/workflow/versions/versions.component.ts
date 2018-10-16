/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DateService } from '../../shared/date.service';
import { DockstoreService } from '../../shared/dockstore.service';
import { ErrorService } from '../../shared/error.service';
import { ExtendedWorkflowService } from '../../shared/extended-workflow.service';
import { ExtendedWorkflow } from '../../shared/models/ExtendedWorkflow';
import { RefreshService } from '../../shared/refresh.service';
import { SessionQuery } from '../../shared/session/session.query';
import { SessionService } from '../../shared/session/session.service';
import { WorkflowsService } from '../../shared/swagger/api/workflows.service';
import { Workflow } from '../../shared/swagger/model/workflow';
import { WorkflowVersion } from '../../shared/swagger/model/workflowVersion';
import { Versions } from '../../shared/versions';

@Component({
  selector: 'app-versions-workflow',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsWorkflowComponent extends Versions implements OnInit {
  @Input() versions: Array<any>;
  @Input() workflowId: number;
  _selectedVersion: WorkflowVersion;
  @Input() set selectedVersion(value: WorkflowVersion) {
    if (value != null) {
      this._selectedVersion = value;
    }
  }
  @Output() selectedVersionChange = new EventEmitter<WorkflowVersion>();
  public WorkflowType = Workflow;
  workflow: ExtendedWorkflow;
  setNoOrderCols(): Array<number> {
    return [4, 5];
  }

  constructor(dockstoreService: DockstoreService, dateService: DateService, private sessionService: SessionService,
    private errorService: ErrorService, private extendedWorkflowService: ExtendedWorkflowService,
    private workflowsService: WorkflowsService, private refreshService: RefreshService, protected sessionQuery: SessionQuery) {
    super(dockstoreService, dateService, sessionQuery);
  }

  ngOnInit() {
    this.publicPageSubscription();
    this.extendedWorkflowService.extendedWorkflow$.subscribe(workflow => {
      this.workflow = workflow;
      if (workflow) {
        this.defaultVersion = workflow.defaultVersion;
      }
      this.dtOptions = {
        bFilter: false,
        bPaginate: false,
        columnDefs: [
          {
            orderable: false,
            targets: this.setNoOrderCols()
          }
        ]
      };
    });
  }

  updateDefaultVersion(newDefaultVersion: string): void {
    if (this.publicPage) {
      return;
    }
    const message = 'Updating default workflow version';
    this.sessionService.setRefreshMessage(message + '...');
    this.workflowsService.updateWorkflowDefaultVersion(this.workflowId, newDefaultVersion).subscribe(response => {
        this.refreshService.handleSuccess(message);
        if (this.workflow.mode !== Workflow.ModeEnum.HOSTED) {
          this.refreshService.refreshWorkflow();
        }
      }, error => this.refreshService.handleError(message, error));
  }


  /**
   * Updates the version and emits an event for the parent component
   * @param {WorkflowVersion} version - version to make the selected version
   * @returns {void}
   */
  setVersion(version: WorkflowVersion): void {
    this._selectedVersion = version;
    this.selectedVersionChange.emit(this._selectedVersion);
  }
}
