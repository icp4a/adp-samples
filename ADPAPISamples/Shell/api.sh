#!/bin/bash

source config.sh

if [ "${server_url}" == "example.ibm.com" ] || [ "${project_id}" == "project-id" ] || [ "${api_key}" == "api key example" ]
then
    echo "Please specify your valid configuration in config.sh and try again."
else
    # post file
    echo "Start uploading file"
    response=$(curl -k -X POST "https://${server_url}/adp/aca/v1/projects/${project_id}/analyzers"\
    -H "Authorization: ZenApiKey ${api_key}"\
    -F "responseType=json,pdf"\
    -F "jsonOptions=dc,kvp"\
    -F "file=@./INV_016_1.pdf")

    file_id=$(echo $response | grep -Eo '"analyzerId":(\d*?,|.*?[^\\]",)' |  cut -d ':' -f 2 | cut -d '"' -f 2)
    echo "file_id"
    echo $file_id

    sleep 2

    json_status=""
    secs=60
    SECONDS=0
    while [ "$json_status" != "Completed" ] && [ $SECONDS -le $secs ]
    do
        # get file status
        echo "Get file status"
        status_response=$(curl -k -X GET "https://${server_url}/adp/aca/v1/projects/${project_id}/analyzers/$file_id"\
        -H "Authorization: ZenApiKey ${api_key}")

        json_status=$(echo $status_response | grep -Eo '"type": "JSON", "status":(\d*?,|.*?[^\\]",)' |  cut -d ':' -f 3 | cut -d '"' -f 2)
        echo "json_status"
        echo $json_status
        sleep 5
    done

    echo "Upload file completed!"

    # get default json
    echo "Download default file JSON"
    curl -k -X GET "https://${server_url}/adp/aca/v1/projects/${project_id}/analyzers/${file_id}/json"\
    -H "Authorization: ZenApiKey ${api_key}"

    sleep 2

    # get simple json
    echo "Download simple version of file JSON"
    curl -k -X GET "https://${server_url}/adp/aca/v1/projects/${project_id}/analyzers/${file_id}/json?outputJSON=basic"\
    -H "Authorization: ZenApiKey ${api_key}"

    sleep 2

    # delete file
    echo "Delete uploaded file"
    curl -k -X DELETE "https://${server_url}/adp/aca/v1/projects/${project_id}/analyzers/${file_id}"\
    -H "Authorization: ZenApiKey ${api_key}"

    echo "Script done!"
fi
