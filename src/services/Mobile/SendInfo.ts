import episodeService from '../api/episode/episodeService';
import groupService from '../api/group/groupService';
import patientService from '../api/patientService/patientService';
import patientServiceIdentifierService from '../api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from '../api/patientVisit/patientVisitService';
import useNotify from 'src/composables/shared/notify/UseNotify';
import { useOffline } from 'src/composables/shared/loadParamsToOffline/offline';
import UsersService from '../UsersService';
const {
  loadPatientDataToOffline,
  loadSettingParamsToOffline,
  loadStockDistribuitionData,
} = useOffline();
const { notifySuccess, notifyInfo } = useNotify();
export function sendData() {
  // function sendDataToBackEnd() {
  function getPatientsToSend() {
    notifyInfo('Envio dos Dados do Paciente Iniciado');
    patientService
      .getLocalDbPatientsToSync()
      .then((patientsToSync) => {
        console.log('patients' + patientsToSync.length);
        return patientsToSync;
      })
      .then((patientsToSync) => {
        apiSendPatients(patientsToSync, 0);
      });

    function apiSendPatients(patientsToSync: any, i: number) {
      const patient = patientsToSync[i];
      if (patient !== undefined) {
        patientService
          .syncPatient(patient)
          .then((resp) => {
            i = i + 1;
            patient.syncStatus = 'S';
            // Get Childs TO Update
            patientService.putMobile(patient);
            setTimeout(apiSendPatients(patientsToSync, i), 200);
          })
          .catch((error) => {
            i = i + 1;
            setTimeout(apiSendPatients(patientsToSync, i), 200);
            console.log(error);
          });
      } else {
        getPatientServiceIdentifierToSend();
      }
    }
  }
  function getPatientServiceIdentifierToSend() {
    patientServiceIdentifierService
      .getLocalDbPatientServiceIdentifierToSync()
      .then((identifiersToSync) => {
        console.log('identifiersToSync' + identifiersToSync.length);
        return identifiersToSync;
      })
      .then((identifiersToSync) => {
        apiSendPatientServiceIdentifier(identifiersToSync, 0);
      });

    function apiSendPatientServiceIdentifier(
      identifiersToSync: any,
      i: number
    ) {
      const identifier = identifiersToSync[i];
      if (identifier !== undefined) {
        console.log(identifier);
        patientServiceIdentifierService
          .syncPatientServiceIdentifier(identifier)
          .then((resp) => {
            i = i + 1;
            identifier.syncStatus = 'S';
            // Get Childs TO Update
            patientServiceIdentifierService.putMobile(identifier);
            setTimeout(
              apiSendPatientServiceIdentifier(identifiersToSync, i),
              200
            );
          })
          .catch((error) => {
            i = i + 1;
            setTimeout(
              apiSendPatientServiceIdentifier(identifiersToSync, i),
              200
            );
            console.log(error);
          });
      } else {
        getEpisodeToSend();
      }
    }
  }

  function getEpisodeToSend() {
    episodeService
      .getLocalDbEpisodesToSync()
      .then((episodesToSync) => {
        return episodesToSync;
      })
      .then((episodesToSync) => {
        apiSendEpisode(episodesToSync, 0);
      });

    function apiSendEpisode(episodesToSync: any, i: number) {
      const episode = episodesToSync[i];
      if (episode !== undefined) {
        //  episode.patientVisitDetails = []
        episodeService
          .syncEpisode(episode)
          .then((resp) => {
            i = i + 1;
            episode.syncStatus = 'S';
            // episode.id = resp.response.data.id
            // Get Childs TO Update
            episodeService.putMobile(episode);
            setTimeout(apiSendEpisode(episodesToSync, i), 200);
          })
          .catch((error) => {
            i = i + 1;
            setTimeout(apiSendEpisode(episodesToSync, i), 200);
            console.log(error);
          });
      } else {
        getPatientVisitToSend();
      }
    }
  }
  function getPatientVisitToSend() {
    patientVisitService
      .getLocalDbPatientVisitsToSync()
      .then((patientVisitToSync) => {
        return patientVisitToSync;
      })
      .then((patientVisitToSync) => {
        console.log(patientVisitToSync[0]);
        apiSendPatientVisit(patientVisitToSync, 0);
      });
  }
  async function apiSendPatientVisit(patientVisitToSync: any, i: number) {
    const patientVisit = patientVisitToSync[i];
    if (patientVisit !== undefined) {
      const patientVisitModified =
        patientVisitService.setPackagedDrugStockNullToSend(patientVisit);
      console.log(patientVisitModified);
      await patientVisitService
        .postWeb(patientVisitModified)
        .then((resp) => {
          i = i + 1;
          patientVisit.syncStatus = 'S';
          // patientVisit.id = resp.response.data.id
          // Get Childs TO Update
          patientVisitService.putMobile(patientVisit);
          setTimeout(apiSendPatientVisit(patientVisitToSync, i), 200);
        })
        .catch((error) => {
          i = i + 1;
          setTimeout(apiSendPatientVisit(patientVisitToSync, i), 200);
          console.log(error);
        });
    } else {
      // getGroupsToSend();
      notifySuccess('Envio de Dados do Paciente Terminado');
      // loadSettingParamsToOffline();
      loadPatientDataToOffline();
      loadStockDistribuitionData();
    }
  }

  function getGroupsToSend() {
    groupService
      .getLocalDbGroupsToSync()
      .then((groupsToSync) => {
        return groupsToSync;
      })
      .then((groupsToSync) => {
        console.log('Groups_To_Sync: ', groupsToSync);
        apiSendGroups(groupsToSync, 0);
      });

    function apiSendGroups(groupsToSync: any, i: number) {
      const group = groupsToSync[i];
      if (group !== undefined) {
        groupService
          .apiSave(group)
          .then((resp) => {
            i = i + 1;
            group.syncStatus = 'S';
            // groupService.putMobile(group).then((group) => {
            console.log('Group_Syncronized: ', group);
            setTimeout(this.apiSendGroups(groupsToSync, i), 200);
            // })
          })
          .catch((error) => {
            i = i + 1;
            // setTimeout(this.apiSendPatientVisit(patientVisitToSync, i), 200)
            console.log(error);
          });
      } else {
        //  this.getGroupsMemberPrescriptionToSend()
      }
    }
    //  }
  }
  return { getPatientsToSend, getGroupsToSend };
}
