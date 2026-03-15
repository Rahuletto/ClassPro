package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
	"github.com/valyala/fasthttp"
)

type LoginFetcher struct{}

type Session struct {
	PostResponse struct {
		StatusCode int `json:"status_code"`
		Lookup     struct {
			Identifier string `json:"identifier"`
			Digest     string `json:"digest"`
		} `json:"lookup"`
	} `json:"postResponse"`
	PassResponse struct {
		StatusCode int `json:"status_code"`
	} `json:"passResponse"`
	Cookies string `json:"Cookies"`
	Message string `json:"message"`
	Errors  string `json:"errors"`
}

type LoginResponse struct {
	Authenticated bool                   `json:"authenticated"`
	Session       map[string]interface{} `json:"session"`
	Lookup        any                    `json:"lookup"`
	Cookies       string                 `json:"cookies"`
	Status        int                    `json:"status"`
	Message       any                    `json:"message"`
	Errors        []string               `json:"errors"`
	Captcha       *CaptchaData           `json:"captcha,omitempty"`
}

type CaptchaData struct {
	Image   string `json:"image"`   // base64 encoded image
	Cdigest string `json:"cdigest"`  // captcha digest
}

func (lf *LoginFetcher) Logout(token string) (map[string]interface{}, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/accounts/p/10002227248/logout?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in")
    req.Header.SetMethod("GET")
    req.Header.Set("Accept-Language", "en-US,en;q=0.9")
    req.Header.Set("Connection", "keep-alive")
    req.Header.Set("DNT", "1")
    req.Header.Set("Referer", "https://academia.srmist.edu.in/")
    req.Header.Set("Sec-Fetch-Dest", "document")
    req.Header.Set("Sec-Fetch-Mode", "navigate")
    req.Header.Set("Sec-Fetch-Site", "same-origin")
    req.Header.Set("Upgrade-Insecure-Requests", "1")
    req.Header.Set("Cookie", token)

	if err := fasthttp.Do(req, resp); err != nil {
		return nil, err
	}

	bodyText := resp.Body()

	result := map[string]interface{}{
		"status": resp.StatusCode(),
		"result": string(bodyText),
	}
	return result, nil
}

func (lf *LoginFetcher) FetchCaptcha(cdigest string) (string, error) {
	url := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha/%s?darkmode=false", cdigest)

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(url)
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&orgtype=40&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36")
	req.Header.Set("cookie", "zalb_74c3a1eecc=18c2ae8cabb778c688e1dd5418e4505b; zalb_f0e8db9d3d=983d6a65b2f29022f18db52385bfc639; stk=843bc5ebcebcef8b08d349f27b55842b; zalb_3309580ed5=151b34e5142175e5024c18055cece0f8; CT_CSRF_TOKEN=d933d841-b40b-427e-bfd7-83dbb4176ba1; iamcsr=5547d81f41ddb2cd9e1df2bb815dacff32f0a605d0a439b94d267d51108d513b0c6557e76ceb08be4882a41d82141e0c17818610f5c4ab1884dd57e79c880c83; zccpn=290cd2fceee5e981c5d075053108921c56c050db75563e543b8ecd4ae1487e06952e133e0e6098a1dbf16fad3c563f68994dc871cb4c5c648af78620df74ad2e; _zcsr_tmp=290cd2fceee5e981c5d075053108921c56c050db75563e543b8ecd4ae1487e06952e133e0e6098a1dbf16fad3c563f68994dc871cb4c5c648af78620df74ad2e; cli_rgn=IN; JSESSIONID=79DACADBAAD213B7B4739C09F9D3F247")

	if err := fasthttp.Do(req, resp); err != nil {
		return "", fmt.Errorf("captcha request failed: %v", err)
	}

	if resp.StatusCode() != 200 {
		return "", fmt.Errorf("captcha HTTP error: %d", resp.StatusCode())
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &parsed); err != nil {
		return "", fmt.Errorf("failed to parse captcha JSON: %v", err)
	}

	captcha, ok := parsed["captcha"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid captcha format: missing 'captcha' field")
	}

	imageBytes, ok := captcha["image_bytes"].(string)
	if !ok || imageBytes == "" {
		return "", fmt.Errorf("invalid captcha format: missing 'image_bytes'")
	}

	return imageBytes, nil
}

func (lf *LoginFetcher) Login(username, password string, cdigest, captcha *string) (*LoginResponse, error) {
	user := strings.Replace(username, "@srmist.edu.in", "", 1)

	url := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/lookup/%s@srmist.edu.in", user)

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	cli_time := time.Now().UnixMilli()

	req.SetRequestURI(url)
	req.Header.SetMethod("POST")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Origin", "https://academia.srmist.edu.in")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&orgtype=40&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin")
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36")
	req.Header.Set("X-ZCSRF-TOKEN", "iamcsrcoo=5547d81f41ddb2cd9e1df2bb815dacff32f0a605d0a439b94d267d51108d513b0c6557e76ceb08be4882a41d82141e0c17818610f5c4ab1884dd57e79c880c83")
	req.Header.Set("cookie", "zalb_74c3a1eecc=18c2ae8cabb778c688e1dd5418e4505b; zalb_f0e8db9d3d=983d6a65b2f29022f18db52385bfc639; stk=843bc5ebcebcef8b08d349f27b55842b; zalb_3309580ed5=151b34e5142175e5024c18055cece0f8; CT_CSRF_TOKEN=d933d841-b40b-427e-bfd7-83dbb4176ba1; iamcsr=5547d81f41ddb2cd9e1df2bb815dacff32f0a605d0a439b94d267d51108d513b0c6557e76ceb08be4882a41d82141e0c17818610f5c4ab1884dd57e79c880c83; zccpn=290cd2fceee5e981c5d075053108921c56c050db75563e543b8ecd4ae1487e06952e133e0e6098a1dbf16fad3c563f68994dc871cb4c5c648af78620df74ad2e; _zcsr_tmp=290cd2fceee5e981c5d075053108921c56c050db75563e543b8ecd4ae1487e06952e133e0e6098a1dbf16fad3c563f68994dc871cb4c5c648af78620df74ad2e; cli_rgn=IN; JSESSIONID=79DACADBAAD213B7B4739C09F9D3F247")

	body := fmt.Sprintf("mode=primary&cli_time=%d&orgtype=40&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin", cli_time)
	
	// Add captcha and cdigest if provided
	if cdigest != nil && captcha != nil {
		body += fmt.Sprintf("&captcha=%s&cdigest=%s", *captcha, *cdigest)
	}
	
	req.SetBody([]byte(body))

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	err := fasthttp.Do(req, resp)
	if err != nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &data); err != nil {
		fmt.Println("ERR", err)
		return nil, err
	}

	if errors, ok := data["errors"].([]interface{}); ok && len(errors) > 0 {
		lookupMsg := errors[0].(map[string]interface{})["message"].(string)
		statusCode := int(data["status_code"].(float64))

		if statusCode == 400 {
			// Check if CAPTCHA is required
			if strings.Contains(data["message"].(string), "HIP") || strings.Contains(lookupMsg, "HIP") {
				cdigestVal, hasCdigest := data["cdigest"]
				if hasCdigest {
					cdigestStr, ok := cdigestVal.(string)
					if ok && cdigestStr != "" {
						// Fetch CAPTCHA image
						captchaImage, err := lf.FetchCaptcha(cdigestStr)
						if err != nil {
							return &LoginResponse{
								Authenticated: false,
								Session:       nil,
								Lookup:        data,
								Cookies:       "",
								Status:        statusCode,
								Message:       data["localized_message"].(string),
								Errors:        []string{lookupMsg},
								Captcha: &CaptchaData{
									Cdigest: cdigestStr,
								},
							}, nil
						}
						
						return &LoginResponse{
							Authenticated: false,
							Session:       nil,
							Lookup:        data,
							Cookies:       "",
							Status:        statusCode,
							Message:       data["localized_message"].(string),
							Errors:        []string{lookupMsg},
							Captcha: &CaptchaData{
								Image:   captchaImage,
								Cdigest: cdigestStr,
							},
						}, nil
					}
				}
				
				// Return error response with original data
				return &LoginResponse{
					Authenticated: false,
					Session:       nil,
					Lookup:        data,
					Cookies:       "",
					Status:        statusCode,
					Message:       data["localized_message"].(string),
					Errors:        []string{lookupMsg},
				}, nil
			}
			
			return &LoginResponse{
				Authenticated: false,
				Session:       nil,
				Lookup:        nil,
				Cookies:       "",
				Status:        statusCode,
				Message:       data["message"].(string),
				Errors:        []string{lookupMsg},
			}, nil
		}
	}

	exists := strings.Contains(data["message"].(string), "User exists")

	if !exists {
		// Check if CAPTCHA is required
		if strings.Contains(data["message"].(string), "HIP") {
			cdigestVal, hasCdigest := data["cdigest"]
			if hasCdigest {
				cdigestStr, ok := cdigestVal.(string)
				if ok && cdigestStr != "" {
					// Fetch CAPTCHA image
					captchaImage, err := lf.FetchCaptcha(cdigestStr)
					if err != nil {
						return &LoginResponse{
							Authenticated: false,
							Session:       nil,
							Lookup:        data,
							Cookies:       "",
							Status:        int(data["status_code"].(float64)),
							Message:       data["localized_message"].(string),
							Errors:        nil,
							Captcha: &CaptchaData{
								Cdigest: cdigestStr,
							},
						}, nil
					}
					
					return &LoginResponse{
						Authenticated: false,
						Session:       nil,
						Lookup:        data,
						Cookies:       "",
						Status:        int(data["status_code"].(float64)),
						Message:       data["localized_message"].(string),
						Errors:        nil,
						Captcha: &CaptchaData{
							Image:   captchaImage,
							Cdigest: cdigestStr,
						},
					}, nil
				}
			}
			
			return &LoginResponse{
				Authenticated: false,
				Session:       nil,
				Lookup:        data,
				Cookies:       "",
				Status:        int(data["status_code"].(float64)),
				Message:       data["localized_message"].(string),
				Errors:        nil,
			}, nil
		}
		
		return &LoginResponse{
			Authenticated: false,
			Session:       nil,
			Lookup:        nil,
			Cookies:       "",
			Status:        int(data["status_code"].(float64)),
			Message:       data["message"].(string),
			Errors:        nil,
		}, nil
	}

	lookup, ok := data["lookup"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid lookup data")
	}

	session, err := lf.GetSession(password, lookup)
	if err != nil {
		return nil, err
	}

	// Safely access passwordauth
	var code interface{}
	passwordAuthVal, hasPasswordAuth := session["passwordauth"]
	if hasPasswordAuth && passwordAuthVal != nil {
		if passwordAuthMap, ok := passwordAuthVal.(map[string]interface{}); ok {
			code = passwordAuthMap["code"]
		}
	}

	// Safely access message
	var message string
	if msgVal, ok := session["message"]; ok && msgVal != nil {
		if msgStr, ok := msgVal.(string); ok {
			message = msgStr
		}
	}

	// Safely access cookies
	var cookies string
	if cookiesVal, ok := session["cookies"]; ok && cookiesVal != nil {
		if cookiesStr, ok := cookiesVal.(string); ok {
			cookies = cookiesStr
		}
	}

	sessionBody := map[string]interface{}{
		"success": true,
		"code":    code,
		"message": message,
	}

	if strings.Contains(strings.ToLower(message), "invalid") || strings.Contains(cookies, "undefined") {
		sessionBody["success"] = false
		return &LoginResponse{
			Authenticated: false,
			Session:       sessionBody,
			Lookup: map[string]string{
				"identifier": lookup["identifier"].(string),
				"digest":     lookup["digest"].(string),
			},
			Cookies: cookies,
			Status:  int(data["status_code"].(float64)),
			Message: message,
			Errors:  nil,
		}, nil
	}

	return &LoginResponse{
		Authenticated: true,
		Session:       sessionBody,
		Lookup:        lookup,
		Cookies:       cookies,
		Status:        int(data["status_code"].(float64)),
		Message:       data["message"],
		Errors:        nil,
	}, nil
}

func (lf *LoginFetcher) GetSession(password string, lookup map[string]interface{}) (map[string]interface{}, error) {
	identifierVal, ok := lookup["identifier"]
	if !ok || identifierVal == nil {
		return nil, fmt.Errorf("missing 'identifier' in lookup map")
	}
	digestVal, ok := lookup["digest"]
	if !ok || digestVal == nil {
		return nil, fmt.Errorf("missing 'digest' in lookup map")
	}

	identifier, ok := identifierVal.(string)
	if !ok {
		return nil, fmt.Errorf("identifier is not a string: %v", identifierVal)
	}
	digest, ok := digestVal.(string)
	if !ok {
		return nil, fmt.Errorf("digest is not a string: %v", digestVal)
	}

	body := fmt.Sprintf(`{"passwordauth":{"password":"%s"}}`, password)

	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	url := fmt.Sprintf(
		"https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/primary/%s/password?digest=%s&cli_time=1713533853845&servicename=ZohoCreator&service_language=en&serviceurl=https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin",
		identifier, digest,
	)


	req.SetRequestURI(url)
	req.Header.SetMethod("POST")
	req.Header.Set("accept", "*/*")
	req.Header.Set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("x-zcsrf-token", "iamcsrcoo=884b99c7-829b-4ddf-8344-ce971784bbe8")
	req.Header.Set("cookie", "f0e8db9d3d=7ad3232c36fdd9cc324fb86c2c0a58ad; bdb5e23bb2=3fe9f31dcc0a470fe8ed75c308e52278; zccpn=221349cd-fad7-4b4b-8c16-9146078c40d5; ZCNEWUIPUBLICPORTAL=true; cli_rgn=IN; iamcsr=884b99c7-829b-4ddf-8344-ce971784bbe8; _zcsr_tmp=884b99c7-829b-4ddf-8344-ce971784bbe8; 74c3a1eecc=d06cba4b90fbc9287c4162d01e13c516;")
	req.SetBody([]byte(body))

	if err := fasthttp.Do(req, resp); err != nil {
		return nil, err
	}

	status := resp.StatusCode()

	if status >= 400 {
		return nil, fmt.Errorf("HTTP error: %d", status)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &data); err != nil {
		return nil, err
	}

	cookies := resp.Header.Peek("Set-Cookie")
	data["cookies"] = string(cookies)

	return data, nil
}



func (lf *LoginFetcher) Cleanup(cookie string) (int, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/accounts/p/10002227248/webclient/v1/account/self/user/self/activesessions")
	req.Header.SetMethod("DELETE")
	req.Header.Set("accept", "*/*")
	req.Header.Set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("x-zcsrf-token", "iamcsrcoo=8cbe86b2191479b497d8195837181ee152bcfd3d607f5a15764130d8fd8ebef9d8a22c03fd4e418d9b4f27a9822f9454bb0bf5694967872771e1db1b5fbd4585")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/announcement/sessions-reminder?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin&service_language=en")
	req.Header.Set("Referrer-Policy", "strict-origin-when-cross-origin")
	req.Header.Set("cookie", cookie)

	if err := fasthttp.Do(req, resp); err != nil {
		return 0, err
	}

	return resp.StatusCode(), nil
}
