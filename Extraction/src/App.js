/*
 * Licensed Materials - Property of IBM (c) Copyright IBM Corp. 2022. All Rights Reserved.
 * 
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
import React from 'react';
import { useState } from 'react';

import styled from 'styled-components';

import {
  Select,
  SelectItem,
  FileUploaderDropContainer,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
  PasswordInput,
  Link,
} from '@carbon/react';
import {
  heading01,
  bodyShort01,
  spacing03,
  spacing04,
  spacing05,
  spacing06,
  spacing09,
  borderSubtle00,
  textError,
} from '@carbon/themes';
import { Close, WarningFilled } from '@carbon/icons-react';
import ReactJson from 'react-json-view';

const AppContainer = styled.div`
  height: calc(100vh - ${spacing09});
  margin: ${spacing06} auto ${spacing06};
  max-width: 1000px;
  border: 1px solid black;
`;

const AppPanel = styled.div`
  padding: ${spacing06};
  height: 315px;
  border-bottom: 1px solid black;
`;

const DoctypeFileContainer = styled.div`
  display: flex;
`;

const DoctypeContainer = styled.div`
  width: 50%;
  margin-right: 25px;
`;

const DocTypeSelect = styled(Select)``;

const FileUploaderWrapper = styled.div`
  padding: ${spacing03} 0;
  height: 200px;
  font-size: 14px;
  position: relative;
`;

const UploadHeaderDiv = styled.div`
  ${heading01}
`;

const UploadExplanDiv = styled.div`
  ${bodyShort01}
  padding-top:  ${spacing03};
  padding-bottom: ${spacing05};
`;

const UploadedFile = styled.div`
  padding: ${spacing04};
  position: relative;
  height: 36px;
`;

const UploadFileName = styled.div`
  width: 450px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: normal;
`;

const FileStatusWrapper = styled.div`
  position: absolute;
  bottom: 5px;
  right: 10px;
`;

const FileErrorMessage = styled.div`
  line-height: normal;
  height: auto;
  padding: 13px 13px 12px 13px;
  position: relative;
  color: ${textError};
  border-top: 1px solid ${borderSubtle00};
`;

const SelectedFileWrapper = styled.div``;

const SelectedFileErrorWrapper = styled(SelectedFileWrapper)`
  border: 1px solid #da1e28;
`;

const ResetIcon = styled(Close)`
  cursor: pointer;
`;

const ResetIconDisabled = styled(ResetIcon)`
  opacity: 0.2;
`;

const ErrorIcon = styled(WarningFilled)`
  fill: #da1e28;
  margin-left: 10px;
  margin-right: 10px;
`;

const UploadButton = styled(Button)`
  position: absolute;
  right: 0;
  bottom: -70px;
`;

const PropertiesButton = styled(Button)`
  float: right;
  margin-top: 15px;
`;

const ResultsContainer = styled.div`
  height: calc(100vh - 365px);
  overflow: auto;
  padding: 10px;
`;

const StatusContainer = styled.div`
  padding: 10px;
`;

const LoginLink = styled(Link)`
  float: right;
  padding-right: 30px;
  padding-top: 5px;
  cursor: pointer;
`;

const LoginErrorMsg = styled.div`
  color: ${textError};
`;

const docTypePropertyHeaderData = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'displayName',
    header: 'Display name',
  },
  {
    key: 'type',
    header: 'Type',
  },
];

function App() {
  // Array of accepted file extensions.
  const ACCEPTED_FILE_TYPES = ['.pdf', '.tiff', '.docx', '.png', '.jpg'];

  // Maxiumum size of files accepted for upload. Valid values are a number followed by 'KB', 'MB', or 'GB'.
  const MAX_SIZE = '20MB';

  const EMPTY_DOCTYPE_PLACEHOLDER = '__placeholder';

  const [docTypes, setDocTypes] = useState({});
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileName, setFileName] = useState('');
  const [processingInProgress, setProcessingInProgress] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(null);
  const [documentJson, setDocumentJson] = useState(null);
  const [displayDoctypeProperties, setDisplayDoctypeProperties] =
    useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayLoginDlg, setDisplayLogonDlg] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginSuccessful, setLoginSuccessful] = useState(true);

  const getOntology = () => {
    fetch('/api/ontology')
      .then((res) => res.json())
      .then((response) => {
        if (response.status.code === 200) {
          let docClasses = {};
          response.result.Ontology.forEach((docClass) => {
            docClasses[docClass.DocClass] = docClass;
          });
          setDocTypes(docClasses);
        } else {
          alert('An error occured retrieving ontology');
        }
      })
      .catch((error) => {
        console.log('An error occured retrieving ontology: ' + error.message);
      });
  };

  const login = () => {
    fetch('/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.status === 200) {
          setIsAuthenticated(true);
          setDisplayLogonDlg(false);
          getOntology();
        } else {
          setLoginSuccessful(false);
        }
      })
      .catch((error) => {
        setLoginSuccessful(false);
      });
  };

  // When the page loads, get the ontology and store the name and display name of each
  // document type in state.
  React.useEffect(() => {
    fetch('/authEnabled')
      .then((res) => res.json())
      .then((response) => {
        setAuthEnabled(response.authEnabled);
        setIsAuthenticated(response.authenticated);
        setDisplayLogonDlg(!response.authenticated);
        if (response.authenticated) {
          getOntology();
        }
      });
  }, []);

  let maximumFileSizeInt = 0;
  if (
    typeof MAX_SIZE === 'string' &&
    (MAX_SIZE.endsWith('KB') ||
      MAX_SIZE.endsWith('MB') ||
      MAX_SIZE.endsWith('GB'))
  ) {
    const maxFileSizeInt = parseInt(MAX_SIZE);
    if (MAX_SIZE.endsWith('KB')) {
      maximumFileSizeInt = maxFileSizeInt * 1024;
    } else if (MAX_SIZE.endsWith('MB')) {
      maximumFileSizeInt = maxFileSizeInt * 1048576;
    } else {
      maximumFileSizeInt = maxFileSizeInt * 1073741824;
    }
  } else {
    console.error(
      'Invalid value for MAX_SIZE. The value must be a string starting with a number ending in KB, MB, or GB ',
      MAX_SIZE
    );
  }

  const onSelectDoctype = (evt) => {
    setSelectedDocType(
      evt.target.value === EMPTY_DOCTYPE_PLACEHOLDER ? null : evt.target.value
    );
    setDocumentJson(null);
    setDisplayDoctypeProperties(false);
  };

  const onSelectFile = (evt, fileList) => {
    const { addedFiles } = fileList;
    const file = addedFiles[0];
    setFileName(file.name);
    setDocumentJson(null);

    let typeError = true;
    for (let i = 0; i < ACCEPTED_FILE_TYPES.length; i++) {
      if (file.name.toLowerCase().endsWith(ACCEPTED_FILE_TYPES[i])) {
        typeError = false;
        break;
      }
    }
    if (typeError) {
      setFileTypeError(true);
      setSelectedFile(null);
      return;
    }
    setFileTypeError(false);

    if (file.size > maximumFileSizeInt) {
      setFileSizeError(true);
      setSelectedFile(null);
      return;
    }
    setFileSizeError(false);
    setSelectedFile(file);
  };

  const onCancelFile = () => {
    setFileSizeError(false);
    setFileTypeError(false);
    setFileName('');
    setDocumentJson(null);
    setSelectedFile(null);
  };

  const onClickUpload = () => {
    setProcessingInProgress(true);
    setDocumentJson(null);
    setDisplayDoctypeProperties(false);

    // Create the FormData with the file and document type.
    const payload = new FormData();
    payload.append('file', selectedFile);
    payload.append('jsonOptions', 'ocr,dc,kvp,sn,hr,th,mt,ds,char');
    payload.append('responseType', 'json');
    payload.append('docClass', selectedDocType);
    fetch('/api/analyzers', {
      method: 'POST',
      body: payload,
    })
      .then((res) => res.json())
      .then((response) => {
        // Get the document ID from the response and start polling for document status every 5 seconds.
        const documentId = response.result[0].data.analyzerId;
        setExtractionProgress(0);
        let pollingInterval = setInterval(() => {
          try {
            fetch(`/api/analyzers/${documentId}`)
              .then((res) => res.json())
              .then((response) => {
                const statusDetails = response.result[0].data.statusDetails[0];
                setExtractionProgress(statusDetails.progress);
                if (statusDetails.status === 'Completed') {
                  // When processing is complete, get the document JSON.
                  clearInterval(pollingInterval);
                  pollingInterval = null;
                  fetch(`/api/analyzers/${documentId}/json?outputJSON=basic`)
                    .then((res) => res.json())
                    .then((response) => {
                      setDocumentJson(response.result[0].data);
                      setProcessingInProgress(false);
                      setExtractionProgress(null);
                    });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          } catch (error) {
            console.log(error);
          }
        }, 5000);
      })
      .catch((error) => {
        console.log(error);
        setProcessingInProgress(false);
      });
  };

  const onClickDisplayProperties = () => {
    setDisplayDoctypeProperties(true);
  };

  const acceptedFileTypes1st = ACCEPTED_FILE_TYPES.slice(
    0,
    ACCEPTED_FILE_TYPES.length - 1
  ).join(', ');
  const acceptedFileTypesStr = `${acceptedFileTypes1st}, and ${
    ACCEPTED_FILE_TYPES[ACCEPTED_FILE_TYPES.length - 1]
  }`;

  const uploadExplanation = `Maximum size is ${MAX_SIZE}. Supported file types are ${acceptedFileTypesStr}.`;

  const docTypeKeys = Object.keys(docTypes);

  const docTypePropertyRowData = [];
  if (displayDoctypeProperties) {
    const keyClassList = docTypes[selectedDocType].KeyClassList;
    keyClassList.map((keyClass) => {
      docTypePropertyRowData.push({
        id: keyClass.KeyClassID,
        name: keyClass.KeyClassName,
        type: keyClass.Datatype,
        displayName: keyClass.DisplayName,
      });
    });
  }

  const handleCloseLogin = () => {
    setDisplayLogonDlg(false);
  };

  const handleDisplayLogin = () => {
    setDisplayLogonDlg(!displayLoginDlg);
    setLoginSuccessful(true);
  };

  const handleLogout = () => {
    fetch('/logout', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {},
    });
    setIsAuthenticated(false);
    setDocTypes({});
    setSelectedDocType(null);
    setSelectedFile(null);
    setDisplayDoctypeProperties(false);
    setFileName('');
  };

  const handlePasswordChange = (evt) => {
    const { value } = evt.target;
    setPassword(value);
    setLoginSuccessful(true);
  };

  const handleUsernameChange = (evt) => {
    const { value } = evt.target;
    setUsername(value);
    setLoginSuccessful(true);
  };

  let status;
  if (isAuthenticated) {
    if (processingInProgress) {
      if (extractionProgress === null) {
        status = 'Uploading file...';
      } else {
        status = `Extracting. ${extractionProgress}% complete...`;
      }
    } else if (docTypeKeys.length === 0) {
      status = 'Loading...';
    }
  }

  return (
    <AppContainer>
      {authEnabled && !isAuthenticated && (
        <LoginLink onClick={handleDisplayLogin}>Log in</LoginLink>
      )}
      {authEnabled && isAuthenticated && (
        <LoginLink onClick={handleLogout} disabled={processingInProgress}>
          Log out
        </LoginLink>
      )}
      <AppPanel>
        <>
          <DoctypeFileContainer>
            <DoctypeContainer>
              <DocTypeSelect
                helperText='The document class will be used for documents uploaded for extraction.'
                labelText='Select a document class'
                onChange={onSelectDoctype}
                disabled={processingInProgress || docTypeKeys.length === 0}
                id='docTypeSelect'
              >
                <SelectItem text='' value={EMPTY_DOCTYPE_PLACEHOLDER} />
                {docTypeKeys.map((docTypeKey) => (
                  <SelectItem
                    text={docTypes[docTypeKey].DisplayName}
                    value={docTypes[docTypeKey].DocClass}
                    key={docTypes[docTypeKey].DocClass}
                  />
                ))}
              </DocTypeSelect>
              <PropertiesButton
                disabled={
                  !selectedDocType ||
                  selectedDocType.length === 0 ||
                  processingInProgress ||
                  docTypeKeys.length === 0
                }
                onClick={onClickDisplayProperties}
              >
                Document Class Properties
              </PropertiesButton>
            </DoctypeContainer>
            <FileUploaderWrapper>
              <UploadHeaderDiv>Upload a file</UploadHeaderDiv>
              <UploadExplanDiv>{uploadExplanation}</UploadExplanDiv>
              {!fileSizeError && !fileTypeError && (
                <FileUploaderDropContainer
                  accept={ACCEPTED_FILE_TYPES}
                  labelText='Drag and drop file here or click to select'
                  onAddFiles={onSelectFile}
                  multiple={false}
                  disabled={processingInProgress || docTypeKeys.length === 0}
                />
              )}
              {(fileSizeError || fileTypeError) && (
                <SelectedFileErrorWrapper>
                  <UploadedFile>
                    <UploadFileName>{fileName}</UploadFileName>
                    <FileStatusWrapper>
                      <ErrorIcon />
                      <ResetIcon onClick={onCancelFile} />
                    </FileStatusWrapper>
                  </UploadedFile>
                  <FileErrorMessage>
                    {fileSizeError && 'File exceeds size limit.'}
                    {fileTypeError && 'Invalid file type.'}
                  </FileErrorMessage>
                </SelectedFileErrorWrapper>
              )}
              {!fileSizeError && !fileTypeError && (
                <SelectedFileWrapper>
                  <UploadedFile>
                    <UploadFileName>
                      {fileName.length > 0 ? fileName : null}
                    </UploadFileName>
                    <FileStatusWrapper>
                      {processingInProgress && <ResetIconDisabled />}
                      {!processingInProgress && fileName.length > 0 && (
                        <ResetIcon onClick={onCancelFile} />
                      )}
                    </FileStatusWrapper>
                  </UploadedFile>
                </SelectedFileWrapper>
              )}
              <UploadButton
                disabled={
                  !selectedDocType || !selectedFile || processingInProgress
                }
                onClick={onClickUpload}
              >
                Upload
              </UploadButton>
            </FileUploaderWrapper>
          </DoctypeFileContainer>
        </>
      </AppPanel>
      <ResultsContainer>
        {!displayDoctypeProperties && documentJson && isAuthenticated && (
          <ReactJson src={documentJson} enableClipboard={false} />
        )}
        {!displayDoctypeProperties && !documentJson && (
          <StatusContainer>{status}</StatusContainer>
        )}
        {displayDoctypeProperties && (
          <DataTable
            rows={docTypePropertyRowData}
            headers={docTypePropertyHeaderData}
          >
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <TableContainer
                title={`${docTypes[selectedDocType].DisplayName} properties`}
              >
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}
      </ResultsContainer>
      <Modal
        size='xs'
        open={displayLoginDlg}
        modalHeading='Log in'
        primaryButtonText='Log in'
        secondaryButtonText={'Cancel'}
        onRequestClose={handleCloseLogin}
        onRequestSubmit={login}
      >
        <TextInput
          id='username'
          labelText='User name'
          onChange={handleUsernameChange}
        />
        <PasswordInput
          id='password'
          labelText='Password'
          onChange={handlePasswordChange}
        />
        {!loginSuccessful && <LoginErrorMsg>Login unsucessful</LoginErrorMsg>}
      </Modal>
    </AppContainer>
  );
}

export default App;
