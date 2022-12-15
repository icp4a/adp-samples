/*
 * Licensed Materials - Property of IBM (c) Copyright IBM Corp.  2021 - 2022. All Rights Reserved.
 * 
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with
 * IBM Corp.
 * 
 * DISCLAIMER OF WARRANTIES :
 * 
 * Permission is granted to copy and modify this Sample code, and to distribute modified versions provided that both the
 * copyright notice, and this permission notice and warranty disclaimer appear in all copies and modified versions.
 * 
 * THIS SAMPLE CODE IS LICENSED TO YOU AS-IS. IBM AND ITS SUPPLIERS AND LICENSORS DISCLAIM ALL WARRANTIES, EITHER
 * EXPRESS OR IMPLIED, IN SUCH SAMPLE CODE, INCLUDING THE WARRANTY OF NON-INFRINGEMENT AND THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT WILL IBM OR ITS LICENSORS OR SUPPLIERS BE LIABLE FOR
 * ANY DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO USE THE SAMPLE CODE, DISTRIBUTION OF THE SAMPLE CODE, OR
 * COMBINATION OF THE SAMPLE CODE WITH ANY OTHER CODE. IN NO EVENT SHALL IBM OR ITS LICENSORS AND SUPPLIERS BE LIABLE
 * FOR ANY LOST REVENUE, LOST PROFITS OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE
 * DAMAGES, HOWEVER CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF IBM OR ITS LICENSORS OR SUPPLIERS HAVE
 * BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 */

import com.ibm.dba.content.authn.ServiceAccountAuth;
import com.ibm.dba.content.authn.ServiceAccountUser;

public class CPEServiceAccount extends ServiceAccountUser 
{
    private static CPEServiceAccount instance;

    /**
     * Get singleton instance of Aria Service Account Authentication helper
     */
    static public synchronized ServiceAccountAuth getInstance()
    {
        if (instance == null)
        {
            instance = new CPEServiceAccount();
        }
        return instance;
    }

    protected CPEServiceAccount() 
    {
        super();
    }

    @Override
    protected String getUser() 
    {
        String user = System.getenv(Constants.CPE_SERVICE_USER);
        if (user != null)
            return user.trim();

        throw new RuntimeException("Missing environment variable: " + Constants.CPE_SERVICE_USER);
    }

    @Override
    protected String getPasswd() 
    {
        String pwd = System.getenv(Constants.CPE_SERVICE_PWD);
        if (pwd != null)
            return pwd.trim();

        throw new RuntimeException("Missing environment variable: " + Constants.CPE_SERVICE_PWD);
    }
    
    @Override
    protected String getClientId() 
    {
    	return null;
    }
    
    @Override
    protected String getClientSecret() 
    {
    	return null;
    }
}
