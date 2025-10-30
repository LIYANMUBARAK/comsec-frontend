import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { CompanyService } from '../../core/services/company.service';
import Swal from 'sweetalert2';
import { catchError, map, Observable, tap } from 'rxjs';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  NavigationStart,
} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Location } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { ShareholderEditModalComponent } from '../edit/shareholder-edit-modal/shareholder-edit-modal.component';
import { DirectorEditModalComponent } from '../edit/director-edit-modal/director-edit-modal.component';

interface BuisnessNature {
  value: string;
  code: string;
}

@Component({
  selector: 'app-project-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeSelectModule,
    DropdownModule,
    ButtonModule,
    SelectModule,
    ShareholderEditModalComponent,
    DirectorEditModalComponent,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  public isCompanySelected: boolean = false;
  companyId!: any;
  public isShareLoading = false;
  public isDirectorLoading = false;
  public isInviteLoading = false;
  public isSaveLoading = false;
  public isSubmitLoading = false;
  editModalOpen: boolean = false;
  isInvited: boolean = false;
  editSharesModalOpen: boolean = false;
  inviteShareHolderForm: boolean = false;
  showInviteForm: boolean = false;
  selectedDirector: any = null;
  isDirectorEditModalOpen = false;
  isShareholderFormVisible = false;
  isSharedsEditing: boolean = false;
  editShareForm!: FormGroup;
  isEditing: boolean = false;
  isViewModalOpen: boolean = false;
  currentShareId: string = '';
  tabs: any[] = [
    'Company Info',
    'Shares Info',
    'Directors',
    'Company Secretary',
  ];

  shareCapitalList: any[] = [];
  shareholders: any[] = [];
  activeTabIndex = 0;
  currentHolder: any;
  showForm: boolean = false;
  shareholderTabIndex: number = 2;
  DirectorTabIndex: number = 3;
  invateShareHolderForm: boolean = false;
  imagePreview: string | null = null;
  selectedShareholder: any | null = null;
  isEditModalOpen = false;
  imagePreviewDirectorsId: string | ArrayBuffer | null = null;
  imagePreviewDirectorsAddressProof: string | ArrayBuffer | null = null;
  imagePreviewCompanySecretaryId: string | ArrayBuffer | null = null;
  imagePreviewCompanySecretaryAddressProof: string | ArrayBuffer | null = null;
  addressProofDirectors: string | ArrayBuffer | null = null;
  directorsInfoOpen: boolean = false;
  directorInvateOpen: boolean = false;
  addressProofPreview: string | null = null;
  idProofPreview: string | ArrayBuffer | null = null;
  companyInfoForm!: FormGroup;
  addShareForm!: FormGroup;
  shareHoldersForm!: FormGroup;
  inviteShareholderForm!: FormGroup;
  directorInformationForm!: FormGroup;
  directorsInformation: any[] = [];
  InviteDirectorsForm!: FormGroup;
  comapnySecretaryForm!: FormGroup;
  selectedDirectorUserType: string = 'person';
  selectedNodes: string = '';
  selectedCountry = '';
  userData: any;
  userId: any;
  invitationToken: string | null = null;
  invitationData: any = null;
  isInvitationValid = false;
  isLoading = false;
  selectedShareClass: string = '';
  invitedDirectors: any[] = [];

  selectedShareClass1: string = '';
  selectedUnpaidAmount1: number | null = null;

  // For Row 2
  selectedShareClass2: string = '';
  selectedUnpaidAmount2: number | null = null;

  dropdowns: { [key: string]: { isOpen: boolean; selected: string | null } } = {
    telephone1: { isOpen: false, selected: '+91' },
    telephone2: { isOpen: false, selected: '+91' },
    telephone3: { isOpen: false, selected: '+91' },
    telephone4: { isOpen: false, selected: '+91' },
    telephone5: { isOpen: false, selected: '+91' },
    fax1: { isOpen: false, selected: '+91' },
    fax2: { isOpen: false, selected: '+91' },
  };


  // Add these properties to your component class
  shareRows: { shareClass: string; unpaidAmount: number | null }[] = [
    { shareClass: '', unpaidAmount: null },
  ];

  // For second form (if you have another similar table)
  shareRows2: { shareClass: string; unpaidAmount: number | null }[] = [
    { shareClass: '', unpaidAmount: null },
  ];

  selectedShareUnpaidAmount: any = '';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  errorMessage = '';
  private router = inject(Router);
  private authservice = inject(AuthService);
  private themeService = inject(ThemeService);
  private isNavigatingAway = false;
  constructor(private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigatingAway = true; // User is navigating to a new page
      }
    });
    // Subscribe to router events to handle browser back/forward
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     // Get tab index from URL if present
    //     const tabIndex = this.getTabIndexFromUrl();
    //     if (tabIndex !== null) {
    //       this.activeTabIndex = tabIndex;
    //     }
    //   }
    // })
  }
  countries = [
    { name: 'Australia', code: '+61' },
    { name: 'Brazil', code: '+55' },
    { name: 'China', code: '+86' },
    { name: 'Egypt', code: '+20' },
    { name: 'France', code: '+33' },
    { name: 'Germany', code: '+49' },
    { name: 'India', code: '+91' },
    { name: 'Japan', code: '+81' },
    { name: 'Spain', code: '+34' },
    { name: 'United States', code: '+1' },
  ];

  buisnessNature = [
    {
      value: 'Crop and animal production, hunting.',
      code: '001',
    },
    {
      value: 'Forestry activities',
      code: '002',
    },
    {
      value: 'Fishing and aquaculture',
      code: '003',
    },
    {
      value: 'Mining of coal and lignite',
      code: '005',
    },
    {
      value: 'Extraction of crude petroleum and natural gas',
      code: '006',
    },
    {
      value: 'Mining of metal ores',
      code: '007',
    },
    {
      value: 'Quarrying and other mining of non-metal ores',
      code: '008',
    },
    {
      value: 'Mining support service activities',
      code: '009',
    },
    {
      value: 'Manufacture of food products',
      code: '010',
    },
    {
      value: 'Manufacture of beverages',
      code: '011',
    },
    {
      value: 'Manufacture of tobacco products',
      code: '012',
    },
    {
      value: 'Manufacture of textiles',
      code: '013',
    },
    {
      value: 'Manufacture of wearing apparel',
      code: '014',
    },
    {
      value: 'Manufacture of leather and related products',
      code: '015',
    },
    {
      value:
        'Manufacture of wood and of products of wood and cork, articles of straw and plaiting materials (except furniture and toys)',
      code: '016',
    },
    {
      value: 'Manufacture of paper and paper products',
      code: '017',
    },
    {
      value: 'Printing and reproduction of recorded media',
      code: '018',
    },
    {
      value: 'Manufacture of coke and refined petroleum products',
      code: '019',
    },
    {
      value: 'Manufacture of chemicals and chemical products',
      code: '020',
    },
    {
      value:
        'Manufacture of pharmaceuticals, medicinal chemical and botanical products',
      code: '021',
    },
    {
      value:
        'Manufacture of rubber and plastics products (except furniture, toys, sports goods and stationery)',
      code: '022',
    },
    {
      value: 'Manufacture of other non-metallic mineral products',
      code: '023',
    },
    {
      value: 'Manufacture of basic metals',
      code: '024',
    },
    {
      value:
        'Manufacture of fabricated metal products (except machinery and equipment)',
      code: '025',
    },
    {
      value: 'Manufacture of computer, electronic and optical products',
      code: '026',
    },
    {
      value: 'Manufacture of electrical equipment',
      code: '027',
    },
    {
      value: 'Manufacture of machinery and equipment n.e.c.',
      code: '028',
    },
    {
      value: 'Body assembly of motor vehicles',
      code: '029',
    },
    {
      value: 'Manufacture of other transport equipment',
      code: '030',
    },
    {
      value: 'Manufacture of furniture',
      code: '031',
    },
    {
      value: 'Other manufacturing',
      code: '032',
    },
    {
      value: 'Repair and installation of machinery and equipment',
      code: '033',
    },
    {
      value: 'Electrcity and Gas Supply',
      code: '035',
    },
    {
      value: 'Water collection, treatment and supply',
      code: '036',
    },
    {
      value: 'Sewerage',
      code: '037',
    },
    {
      value:
        'Waste collection, treatment and disposal activities; materials recovery',
      code: '038',
    },
    {
      value: 'Remediation activities and other waste management services',
      code: '039',
    },
    {
      value: 'Construction of buildings',
      code: '041',
    },
    {
      value: 'Civil engineering',
      code: '042',
    },
    {
      value: 'Specialised Construction Activities',
      code: '043',
    },
    {
      value: 'Import and export trade ',
      code: '045',
    },
    {
      value: 'Wholesale',
      code: '046',
    },
    {
      value: 'Retail Trade',
      code: '047',
    },
    {
      value: 'Land Transport',
      code: '049',
    },
    {
      value: 'Water Transport',
      code: '050',
    },
    {
      value: 'Air Transport',
      code: '051',
    },
    {
      value: 'Warehousing and support activities for transportation',
      code: '052',
    },
    {
      value: 'Postal and courier activities',
      code: '053',
    },
    {
      value: 'Short term accommodation activities',
      code: '055',
    },
    {
      value: 'Food and beverage service activities',
      code: '056',
    },
    {
      value: 'Publishing activities',
      code: '058',
    },
    {
      value:
        'Motion picture, video and television programme production, sound recording and music publishing activities',
      code: '059',
    },
    {
      value: 'Programming and broadcasting activities',
      code: '060',
    },
    {
      value: 'Telecommunications',
      code: '061',
    },
    {
      value: 'Information technology service activities',
      code: '062',
    },
    {
      value: 'Information service activities',
      code: '063',
    },
    {
      value:
        'Financial service activities, including investment and holding companies, and the activities of trusts, funds and similar financial entities.',
      code: '064',
    },
    {
      value: 'Insurance (including pension funding) ',
      code: '065',
    },
    {
      value:
        'Activities auxiliary to financial service and insurance activities',
      code: '066',
    },
    {
      value: 'Real estate activities',
      code: '068',
    },
    {
      value: 'Legal and accounting activities',
      code: '069',
    },
    {
      value:
        'Activities of head offices; management and management consultancy activities',
      code: '070',
    },
    {
      value:
        'Architecture and engineering activities, technical testing and analysis',
      code: '071',
    },
    {
      value: 'Scientific research and development',
      code: '072',
    },
    {
      value: 'Veterinary activities',
      code: '073',
    },
    {
      value: 'Advertising and market research',
      code: '074',
    },
    {
      value: 'Other professional, scientific and technical activities',
      code: '075',
    },
    {
      value: 'Rental and leasing activities',
      code: '077',
    },
    {
      value: 'Employment activities',
      code: '078',
    },
    {
      value: 'Travel agency, reservation service and related activities',
      code: '079',
    },
    {
      value: 'Security and investigation activities ',
      code: '080',
    },
    {
      value: 'Services to buildings and landscape care activities',
      code: '081',
    },
    {
      value:
        'Office administrative, office support and other business support activities',
      code: '082',
    },
    {
      value: 'Public administration',
      code: '084',
    },
    {
      value: 'Education',
      code: '085',
    },
    {
      value: 'Human health activities',
      code: '086',
    },
    {
      value: 'Residential care activities',
      code: '087',
    },
    {
      value: 'Social work activities without accommodation',
      code: '088',
    },
    {
      value: 'Creative and performing arts activities',
      code: '090',
    },
    {
      value: 'Libraries, archives, museums and other cultural activities',
      code: '091',
    },
    {
      value: 'Activities of amusement parks and theme parks',
      code: '092',
    },
    {
      value: 'Sports and other entertainment activities',
      code: '093',
    },
    {
      value: 'Activities of membership organisations',
      code: '094',
    },
    {
      value:
        'Repair of motor vehicles, motorcycles, computers, personal and household goods',
      code: '095',
    },
    {
      value: 'Other personal service activities',
      code: '096',
    },
    {
      value: 'Activities of households as employers of domestic personnel',
      code: '097',
    },
    {
      value:
        'Goods and services producing activities of private households for own use ',
      code: '098',
    },
    {
      value: 'Activities of extraterritorial organisations and bodies',
      code: '099',
    },
  ];
  isDarkTheme: Boolean = false;
  private fb = inject(FormBuilder);
  isAuthenticated: Boolean = false;
  ngOnInit() {
    this.initializeCompanyInfoForm();
    this.initializeAddSharesForm();
    this.initializeSharesHoldersForm();
    this.initializeInvateSharesHoldersForm();
    this.initializeDirectorInfoForm();
    this.initializeInvateDirectorForm();
    this.initializeCompanySecretaryForm();
    this.getUserDatas();
    //this.addDefaultShareCapital();
    this.initializeEditShareForm();
    this.getInvideDirectosList()

    // Subscribe to theme changes
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme();
    });

    // Handle route parameters (single subscription)
    this.route.queryParams.subscribe((params) => {
      // Handle company ID from URL (priority)
      if (params['companyId']) {
        this.companyId = decodeURIComponent(params['companyId'])
          .trim()
          .replace(/\\$/, '');
        console.log('Set companyId from URL:', this.companyId);
        localStorage.setItem('companyId', this.companyId); // Store it for future use
      } else {
        // Fallback to localStorage
        const savedCompanyId = localStorage.getItem('companyId');
        if (savedCompanyId) {
          this.companyId = savedCompanyId;
          console.log('Found saved companyId:', this.companyId);
        }
      }

      // Handle tab parameter
      const tabParam = params['tab'];
      if (tabParam !== undefined) {
        const tabIndex = parseInt(tabParam, 10);
        if (!isNaN(tabIndex)) {
          // Mark all tabs up to current one as visited
          for (let i = 0; i <= tabIndex; i++) {
            this.visitedTabs[i] = true;
          }
          this.activeTabIndex = tabIndex;

          // Load data based on active tab
          this.loadTabData(tabIndex);
        }
      } else if (this.companyId) {
        // If no tab specified but company ID exists, load company data
        this.loadCompanyData();
      }

      if (params['resume'] === 'true' && this.companyId) {
        // Load all available data for full resume
        console.log("resume workinggggg")
        this.resumeAllFormData();
      }

      // Handle special parameters
      if (params['fromEmail']) {
        this.activeTabIndex = 2;
        this.fetchDirectorsInfo();
      }

      if (params['fromShare']) {
        this.activeTabIndex = 1;
        this.loadShareholderData();
      }

      // Handle invitation token
      this.invitationToken = params['token'];
      if (this.invitationToken) {
        this.validateInvitationToken();
      }
    });

    // Setup authentication check
    this.userData = this.authservice.getUserId();
    this.visitedTabs[0] = true;

    if (this.authservice.isLoggedIn()) {
      this.isAuthenticated = true;
      this.getUserDatas();
    } else if (!this.invitationToken) {
      // Neither logged in nor has token - redirect to login
      this.router.navigate(['/login']);
    }

    // Disable public radio if needed
    const publicRadioEl = document.querySelector('input[value="public"]');
    if (publicRadioEl) {
      publicRadioEl.setAttribute('disabled', 'disabled');
    }

    // Disable form fields
    this.companyInfoForm.get('country_Address')?.disable();
    this.companyInfoForm.get('presentorReferance')?.disable();
  }
  resumeAllFormData() {
    console.log('Resuming all form data for company:', this.companyId);

    // Load data for all tabs
    this.loadCompanyData(); // Tab 0
    this.loadShareholderData(); // Tab 1
    this.fetchDirectorsInfo(); // Tab 2
    this.loadCompanySecretaryData(); // Tab 3

    // Mark all tabs as visited since we're resuming
    this.visitedTabs = [true, true, true, true];
  }
  // New method to load data based on tab index
  private loadTabData(tabIndex: number) {
    switch (tabIndex) {
      case 0:
        // Load company info data if needed
        this.loadCompanyData();
        break;
      case 1:
        // Load shareholder data
        this.loadShareholderData();
        break;
      case 2:
        // Load directors data
        this.fetchDirectorsInfo();
        break;
      case 3:
        // Load company secretary data
        this.loadCompanySecretaryData();
        break;
      // Add other cases as needed
    }

    this.companyInfoForm.get('country_Address')?.disable();
    this.companyInfoForm.get('presentorReferance')?.disable();
  }
  private loadShareholderData() {
    console.log('Loading shareholder data for company:', this.companyId);
    this.getShareCapitalList();
    this.getShareHoldersList();
  }

  ngAfterViewInit() {
    const radioButtons = document.querySelectorAll('input[name="companyType"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.value === 'public') {
          // Force selection back to private
          const privateRadio = document.querySelector(
            'input[value="private"]'
          ) as HTMLInputElement;
          if (privateRadio) privateRadio.checked = true;
        }
      });
    });
  }

  private validateInvitationToken() {
    this.isLoading = true;
    console.log('Validating token:', this.invitationToken);

    this.companyService
      .validateInvitationToken(this.invitationToken!)
      .subscribe({
        next: (response) => {
          if (response.valid) {
            this.invitationData = response.invitationData;
            this.isInvitationValid = true;

            // Log the user in automatically
            this.autoLoginInvitedUser(response);
          } else {
            this.errorMessage = 'Invalid or expired invitation.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage =
            error.error.message || 'Failed to validate invitation.';
          this.isLoading = false;
        },
      });
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-mode');

      // Force PrimeNG components to update their styling
      // You might need to get references to your p-select components
      // For example, if you use ViewChild:
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  private autoLoginInvitedUser(response: any) {
    // Set authentication data in localStorage similar to handleLoginSuccess method
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.invitationData.id);
    localStorage.setItem('userRole', 'Shareholder');
    localStorage.setItem(
      'shareholderData',
      JSON.stringify(response.invitationData)
    );

    // Now that the user is "logged in", get the user data
    this.getUserDatas();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  loadCompanySecretaryData() {
    const userId = localStorage.getItem('userId');

    this.companyService
      .getCompanySecretaryInformation(this.companyId)
      .subscribe({
        next: (response: any) => {
          console.log("RESPONSE OF SECRETARY RESUME PATCHING", response)
          if (response.data[0]) {
            response = response.data[0]
            this.comapnySecretaryForm.patchValue({
              tcspLicenseNo: response.tcspLicenseNo,
              tcspReason: response.tcspReason,
              type: response.type,
              surname: response.surname,
              name: response.name,
              chineeseName: response.chineeseName,
              idNo: response.idNo,
              // idProof: response.idProof,
              address: response.address,
              street: response.street,
              building: response.building,
              district: response.district,
              // addressProof: response.addressProof,
              email: response.email,
              phone: response.phone,
            });

            // Set image previews
            if (response.idProof) {
              this.imagePreviewCompanySecretaryId = response.data.idProof;
            }
            if (response.addressProof) {
              this.imagePreviewCompanySecretaryAddressProof =
                response.data.addressProof;
            }
          }
        },
        error: (error) => {
          console.error('Error loading company secretary data:', error);
        },
      });
  }

  getUserDatas() {
    // Get the userId from localStorage directly
    this.userId = localStorage.getItem('userId');
    console.log('userId:', this.userId);

    if (this.userId) {
      this.authservice.getUserById(this.userId).subscribe({
        next: (user) => {
          this.userData = user;
          console.log('User data:', this.userData);
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        },
      });
    } else {
      console.log('User is not logged in or userId is not available.');
    }
  }

  initializeCompanyInfoForm(): void {
    this.companyInfoForm = this.fb.group({
      companyNameEN: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      companyNameCN: new FormControl('', [Validators.minLength(2)]),
      companyType: [{ value: 'private', disabled: false }, Validators.required],
      natureofCompany: new FormControl<BuisnessNature | null>(null, [
        Validators.required,
      ]),
      code: new FormControl('', [Validators.required]),
      Flat_Address: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      Building_Address: new FormControl('', [Validators.minLength(4)]),
      Street_Address: new FormControl('', [Validators.minLength(4)]),
      District_Address: new FormControl('', [Validators.minLength(4)]),
      country_Address: new FormControl('Hong Kong', [Validators.required]),
      company_Email: new FormControl('', [Validators.email]),
      company_TelCountry: new FormControl('+91', [Validators.required]),
      company_Telphone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
      ]),
      company_FaxCountry: new FormControl('+91'),
      company_Fax: new FormControl('', [
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
      ]),

      subscriptionDuration: new FormControl('1 year', [Validators.required]),
      presentorName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      presentorChiName: new FormControl('', [Validators.minLength(3)]),
      presentorAddress: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      presentorBuilding: new FormControl('', [Validators.minLength(6)]),
      presentorStreet: new FormControl('', [Validators.minLength(6)]),
      presentorDistrict: new FormControl('', [Validators.minLength(6)]),
      presentorTelCountry: new FormControl('+91', [Validators.required]),
      presentorTel: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
      ]),
      presentorFaxCountry: new FormControl('+91'),
      presentorFax: new FormControl('', [
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
      ]),

      presentorEmail: new FormControl('', [Validators.email]),
      presentorReferance: new FormControl('CompanyName-NNC1-06-03-2024', [
        Validators.required,
      ]),
      companyLogo: new FormControl(null),
    });

    // Listen for changes on the `natureofCompany` field
    this.companyInfoForm
      .get('natureofCompany')
      ?.valueChanges.subscribe((selectedNature: BuisnessNature | null) => {
        console.log(selectedNature);

        if (selectedNature) {
          this.companyInfoForm.get('code')?.setValue(selectedNature.code);
        } else {
          this.companyInfoForm.get('code')?.setValue('');
        }
      });
  }

  getErrorMessage(controlName: string): string {
    const control = this.companyInfoForm.get(controlName);

    const fieldNames: { [key: string]: string } = {
      companyNameEN: 'Company Name',
      companyNameCN: 'Company Name (Chinese)',
      companyType: 'Company Type',
      natureofCompany: 'Nature of Company',
      code: 'Code',
      Flat_Address: 'Flat Address',
      Building_Address: 'Building Address',
      Street_Address: 'Street Address',
      District_Address: 'District Address',
      country_Address: 'Country',
      company_Email: 'Company Email',
      company_Telphone: 'Company Telephone',
      company_Fax: 'Company Fax',
      subscriptionDuration: 'Subscription Duration',
      presentorName: 'Presenter Name',
      presentorChiName: 'Presenter Name (Chinese)',
      presentorAddress: 'Presenter Address',
      presentorBuilding: 'Presenter Building',
      presentorStreet: 'Presenter Street',
      presentorDistrict: 'Presenter District',
      presentorTel: 'Presenter Telephone',
      presentorFax: 'Presenter Fax',
      presentorEmail: 'Presenter Email',
      presentorReferance: 'Presenter Reference',
      companyLogo: 'Company Logo',
    };

    const fieldLabel = fieldNames[controlName] || controlName;

    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) {
        return `${fieldLabel} is required.`;
      }
      if (control?.hasError('minlength')) {
        const minLength = control?.getError('minlength').requiredLength;
        return `${fieldLabel} must be at least ${minLength} characters long.`;
      }
      if (control?.hasError('email')) {
        return `Please enter a valid email address for ${fieldLabel}.`;
      }
      if (control?.hasError('pattern')) {
        return `${fieldLabel} must be exactly 8 digits long.`; // Updated message for HK phone numbers
      }
    }
    return '';
  }

  getErrorMessage1(controlName: string): string {
    const control = this.addShareForm.get(controlName);
    if (!control || !(control.touched || control.dirty)) return '';

    // Define user-friendly field names
    const fieldLabels: { [key: string]: string } = {
      class_of_shares: 'Class of Shares',
      total_shares_proposed: 'Total Shares Proposed',
      currency: 'Currency',
      unit_price: 'Unit Price',
      total_amount: 'Total Amount',
      total_capital_subscribed: 'Total Capital Subscribed',
      unpaid_amount: 'Unpaid Amount',
      particulars_of_rights: 'Particulars of Rights',
    };

    const fieldLabel = fieldLabels[controlName] || controlName; // Fallback if not mapped

    // Error messages
    if (control.hasError('required')) {
      return `${fieldLabel} is required.`;
    }
    if (control.hasError('min')) {
      if (controlName === 'total_shares_proposed') {
        return 'You must propose at least 1 share.';
      }
      if (controlName === 'unit_price') {
        return 'Unit price cannot be negative.';
      }
    }

    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.addShareForm.get(controlName);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  getErrorMessage2(fieldName: string): string {
    const control = this.shareHoldersForm.get(fieldName);

    const fieldLabels: { [key: string]: string } = {
      surname: 'Surname',
      name: 'Name',
      chineeseName: 'Chinese Name',
      idNo: 'ID Number',
      idProof: 'ID Proof',
      userType: 'User Type',
      address: 'Address',
      building: 'Building',
      district: 'District',
      street: 'Street',
      addressProof: 'Address Proof',
      email: 'Email',
      phone: 'Phone',
      shareDetailsNoOfShares: 'Number of Shares',
      shareDetailsClassOfShares: 'Class of Shares',
    };

    const fieldLabel = fieldLabels[fieldName] || fieldName;

    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return `${fieldLabel} is required.`;
      }
      if (control.errors['minlength']) {
        const minLength = control.getError('minlength').requiredLength;
        return `${fieldLabel} must be at least ${minLength} characters long.`;
      }
      if (control.errors['email']) {
        return `Please enter a valid email address.`;
      }
      if (control?.hasError('pattern')) {
        return `${fieldLabel} must be exactly 8 digits long.`; // Updated message for HK phone numbers
      }
    }
    return '';
  }

  changeTabShare(index: number) {
    if (!this.currentHolder || this.currentHolder.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Shareholders Added',
        text: 'Please add at least one shareholder before proceeding.',
        confirmButtonText: 'OK',
      });
      return; // Prevent changing the tab
    }

    this.activeTabIndex = index;
  }
  // changeTab(index: number) {
  //   this.activeTabIndex = index;
  // }
  // changeTab(index: number) {
  //   // Check if user can navigate to this tab
  //   if (this.canNavigateToTab(index)) {
  //     this.activeTabIndex = index;
  //     // Update URL with tab index without reloading
  //     this.updateUrlWithTab(index);
  //   }
  // }

  // Helper method to check if navigation is allowed
  canNavigateToTab(index: number): boolean {
    // console.log('Current Tab:', this.activeTabIndex, 'Target Tab:', index);

    // Restrict shareholders to only shareholder tab (index 1)
    if (this.userData.roles === 'Shareholder' && index !== 1) {
      return false;
    }

    // Restrict directors to only director tab (index 2)
    if (this.userData.roles === 'Director' && index !== 2) {
      return false;
    }

    // Special case: Going from Company tab (index 0) to Shareholder tab (index 1)
    if (this.activeTabIndex === 0 && index === 1) {
      return this.isCompanyFormCompleted(); // Require validation here
    }

    // Special case: Going from Shareholder to Director OR Director to Secretary
    if (this.activeTabIndex === 1 && index === 2) {
      return true; // No validation needed
    }

    if (this.activeTabIndex === 2 && index === 3) {
      return true; // No validation needed
    }

    // Allow navigation to previous tabs always
    if (index < this.activeTabIndex) {
      return true;
    }

    // For other cases, use the standard validation logic
    const completedForms = this.getCompletedForms();
    if (index === this.activeTabIndex + 1) {
      return completedForms[this.activeTabIndex];
    }

    return false;
  }

  // Add visited tabs tracking
  private visitedTabs: boolean[] = [false, false, false, false];

  // Update changeTab to mark tabs as visited
  changeTab(index: number) {
    if (this.canNavigateToTab(index)) {
      // Mark current tab as visited
      this.visitedTabs[this.activeTabIndex] = true;
      this.activeTabIndex = index;
      console.log("company Id in changeTab : ", this.companyId)
      console.log("index in change Tab ", index)

      this.updateCurrentStage(this.companyId, index);
      this.updateUrlWithTab(index);

    }
  }

  updateCurrentStage(companyId: any, index: any) {
    console.log('updating current stage');
    console.log('companyId : ', companyId);
    console.log('index : ', index);
    const payload = { companyId: companyId, index: index + 1 };
    if (!companyId) {
      Swal.fire({
        position: 'top-end',
        icon: 'warning',
        title: 'Company Id is Undefined. Retry',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    }
    return this.companyService
      .updateCurrentStage(payload)
      .subscribe((response: any) => {
        try {
          console.log('response from updateCurrentStage : ', response);
        } catch (error) {
          console.log(error);
        }
      });
  }

  // New method to determine if a tab should show a checkmark
  isTabCompleted(index: number): boolean {
    // For shareholder and director tabs, they're "completed" if visited
    if ((index === 1 || index === 2) && this.visitedTabs[index]) {
      return true;
    }

    // For company and secretary tabs, use normal validation
    return this.getCompletedForms()[index];
  }
  // Helper method to track completed forms
  getCompletedForms(): boolean[] {
    return [
      this.isCompanyFormCompleted(),
      this.isShareholderFormCompleted(),
      this.isDirectorFormCompleted(),
      this.isSecretaryFormCompleted(),
    ];
  }

  // Update URL without reloading page
  private updateUrlWithTab(index: number) {
    const url = this.router.createUrlTree([], {
      queryParams: { tab: index },
      queryParamsHandling: 'merge',
    });
    this.location.go(url.toString());
  }

  // Get tab index from URL
  private getTabIndexFromUrl(): number | null {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return tab ? parseInt(tab) : null;
  }

  // Form completion check methods
  private isCompanyFormCompleted(): boolean {
    // console.log('this.shareHoldersForm?.valid || false',this.companyInfoForm?.value,this.companyInfoForm?.valid )
    return this.companyInfoForm?.valid || false;
  }

  private isShareholderFormCompleted(): boolean {
    // console.log('this.shareHoldersForm?.valid || false',this.shareHoldersForm?.value)
    return this.shareHoldersForm.valid || false;
  }

  private isDirectorFormCompleted(): boolean {
    return this.directorInformationForm.valid || false;
  }

  private isSecretaryFormCompleted(): boolean {
    return this.comapnySecretaryForm?.valid || false;
  }

  // Handle browser back button
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    const tabIndex = this.getTabIndexFromUrl();
    if (tabIndex !== null && this.canNavigateToTab(tabIndex)) {
      this.activeTabIndex = tabIndex;
    } else {
      // Prevent navigation if not allowed
      event.preventDefault();
    }
  }

  refreshShareDatas() {
    //this.shareCapitalList();
    this.getShareHoldersList();
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      // Create a FileReader to read the image file as base64
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        console.log('base64 converted image link', this.imagePreview);

        this.companyInfoForm.patchValue({
          companyLogo: this.imagePreview,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Method to trigger file input when edit button is clicked
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Method to remove the image
  removeImage(): void {
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
    this.companyInfoForm.patchValue({
      companyLogo: null,
    });
  }

  onSaveAndNext(): void {
    console.log('companyInfoForm', this.companyInfoForm.value);
    if (this.companyInfoForm.valid) {
      this.isSaveLoading = true;
      this.submitCompanyInfo().subscribe({
        next: () => {
          this.isSaveLoading = false;
          this.changeTab(this.activeTabIndex + 1);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Form submitted successfully.',
            toast: true,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
          // this.addDefaultShareCapital()
        },
        error: () => {
          this.isSaveLoading = false;
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Form submission failed.',
            toast: true,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
          console.warn('Form submission failed, staying on the same tab.');
        },
      });
    } else {
      this.companyInfoForm.markAllAsTouched();
      Swal.fire({
        position: 'top-end',
        icon: 'warning',
        title: 'Form is invalid. Please fix the errors.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      console.warn('Form is invalid. Please fix the errors before proceeding.');
    }
  }

  submitCompanyInfo(): Observable<boolean> {
    const datas = this.companyInfoForm.getRawValue();
    const userId = localStorage.getItem('userId');

    // Include companyId if it exists (for updates)
    const fromValues = {
      ...datas,
      userId,
      currentStage: this.activeTabIndex + 1,
      ...(this.companyId && { companyId: this.companyId }), // Only include if companyId exists
    };

    return this.companyService.submitCompanyInfo(fromValues).pipe(
      tap((response: any) => {
        // Set companyId if it's a new creation
        if (!this.companyId) {
          this.companyId = response.companyId;
          localStorage.removeItem('companyId');
          localStorage.setItem('companyId', this.companyId);
        }

        const messageType = response.isUpdate ? 'updated' : 'submitted';
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `Company information ${messageType} successfully!`,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }),
      catchError((error) => {
        console.error('Error submitting form', error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        throw error;
      }),
      map(() => true)
    );
  }

  onNatureofCompany(event: Event) {
    console.log(event);
    // Optionally update your form value
    // this.companyInfoForm.patchValue({
    //   natureofCompany: event.value
    // });
  }

  addDefaultShareCapital() {
    // Set default values in the form
    this.addShareForm.patchValue({
      class_of_shares: '',
      total_shares_proposed: 1000,
      currency: 'HKD',
      unit_price: 1,
      total_capital_subscribed: 200,
      particulars_of_rights: 'Voting Rights',
    });

    // Calculate the total amount (since it's a disabled field)
    const totalShares =
      this.addShareForm.get('total_shares_proposed')?.value || 0;
    const unitPrice = this.addShareForm.get('unit_price')?.value || 0;
    const totalAmount = totalShares * unitPrice;

    // Set the total amount in the form
    this.addShareForm.get('total_amount')?.setValue(totalAmount);

    // Calculate the unpaid amount (since it's a disabled field)
    const totalSubscribed =
      this.addShareForm.get('total_capital_subscribed')?.value || 0;
    const unpaidAmount = totalAmount - totalSubscribed;

    // Set the unpaid amount in the form
    this.addShareForm.get('unpaid_amount')?.setValue(unpaidAmount);

    // Submit the form automatically
    this.addSharesSubmitDefault();
  }

  addSharesSubmitDefault() {
    console.log('Form Values: ', this.addShareForm.value);
    console.log('Form Raw Values: ', this.addShareForm.getRawValue());
    console.log(
      'Currency Control Value: ',
      this.addShareForm.get('currency')?.value
    );
    const userId = localStorage.getItem('userId');
    Object.keys(this.addShareForm.controls).forEach((key) => {
      const control = this.addShareForm.get(key);
      control?.markAsTouched();
    });
    if (this.addShareForm.invalid) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Please fill in all required fields.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    const shareData = {
      companyId: this.companyId,
      userid: userId,
      currency: this.addShareForm.get('currency')?.value,
      total_shares_proposed: this.addShareForm.get('total_shares_proposed')
        ?.value,
      unit_price: this.addShareForm.get('unit_price')?.value,
      total_capital_subscribed: this.addShareForm.get(
        'total_capital_subscribed'
      )?.value,
      unpaid_amount: this.addShareForm.get('unpaid_amount')?.value,
      class_of_shares: this.addShareForm.get('class_of_shares')?.value,
      particulars_of_rights: this.addShareForm.get('particulars_of_rights')
        ?.value,
    };

    this.companyService.shareCreation(shareData).subscribe({
      next: (response) => {
        // Swal.fire({
        //   position: "top-end",
        //   icon: "success",
        //   title: response.message,
        //   toast: true,
        //   showConfirmButton: false,
        //   timer: 2000,
        //   timerProgressBar: true,
        // });
        this.getShareCapitalList();
        this.resetAddShareForm();
      },
      error: (error) => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to create share.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
    });
  }
  initializeAddSharesForm() {
    this.addShareForm = this.fb.group({
      class_of_shares: ['Ordinary', Validators.required],
      total_shares_proposed: ['', Validators.required],
      currency: ['HKD', Validators.required],
      unit_price: [null, [Validators.required, Validators.min(0)]],
      total_amount: [{ value: null, disabled: true }],
      total_capital_subscribed: ['', Validators.required],
      unpaid_amount: [{ value: 0, disabled: true }],
      particulars_of_rights: [''],
    });

    // Subscribe to changes in unit price and total shares to calculate total amount
    this.addShareForm.get('unit_price')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    this.addShareForm
      .get('total_shares_proposed')
      ?.valueChanges.subscribe(() => {
        this.calculateTotalAmount();
      });

    // Subscribe to changes in total amount and total capital subscribed to calculate unpaid amount
    this.addShareForm.get('total_amount')?.valueChanges.subscribe(() => {
      this.calculateUnpaidAmount();
    });

    this.addShareForm
      .get('total_capital_subscribed')
      ?.valueChanges.subscribe(() => {
        this.validateTotalCapitalSubscribed();
      });

    // Ensure unpaid amount does not exceed total amount
    this.addShareForm.get('unpaid_amount')?.valueChanges.subscribe(() => {
      this.validateUnpaidAmount();
    });
  }

  calculateTotalAmount() {
    const unitPrice = this.addShareForm.get('unit_price')?.value || 0;
    const totalShares =
      this.addShareForm.get('total_shares_proposed')?.value || 0;

    const totalAmount = unitPrice * totalShares;
    this.addShareForm
      .get('total_amount')
      ?.setValue(totalAmount.toFixed(2), { emitEvent: false });

    // Recalculate unpaid amount when total amount changes
    this.calculateUnpaidAmount();
  }

  calculateUnpaidAmount() {
    const totalAmount =
      parseFloat(this.addShareForm.get('total_amount')?.value) || 0;
    let totalCapitalSubscribed =
      parseFloat(this.addShareForm.get('total_capital_subscribed')?.value) || 0;

    // Ensure totalCapitalSubscribed does not exceed totalAmount
    if (totalCapitalSubscribed > totalAmount) {
      totalCapitalSubscribed = totalAmount;
      this.addShareForm
        .get('total_capital_subscribed')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }

    let unpaidAmount = totalAmount - totalCapitalSubscribed;
    unpaidAmount = unpaidAmount < 0 ? 0 : unpaidAmount; // Ensure unpaid amount is not negative

    this.addShareForm
      .get('unpaid_amount')
      ?.setValue(unpaidAmount.toFixed(2), { emitEvent: false });
  }

  validateTotalCapitalSubscribed() {
    const totalAmount =
      parseFloat(this.addShareForm.get('total_amount')?.value) || 0;
    let totalCapitalSubscribed =
      parseFloat(this.addShareForm.get('total_capital_subscribed')?.value) || 0;

    if (totalCapitalSubscribed > totalAmount) {
      this.addShareForm
        .get('total_capital_subscribed')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }

    this.calculateUnpaidAmount();
  }

  validateUnpaidAmount() {
    const unpaidAmount =
      parseFloat(this.addShareForm.get('unpaid_amount')?.value) || 0;
    const totalAmount =
      parseFloat(this.addShareForm.get('total_amount')?.value) || 0;

    if (unpaidAmount > totalAmount) {
      this.addShareForm
        .get('unpaid_amount')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }
  }

  addSharesSubmit() {
    console.log('Form Values: ', this.addShareForm.value);
    console.log('Form Raw Values: ', this.addShareForm.getRawValue());
    console.log(
      'Currency Control Value: ',
      this.addShareForm.get('currency')?.value
    );
    const userId = localStorage.getItem('userId');
    Object.keys(this.addShareForm.controls).forEach((key) => {
      const control = this.addShareForm.get(key);
      control?.markAsTouched();
    });
    if (this.addShareForm.invalid) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Please fill in all required fields.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    const shareData = {
      companyId: this.companyId,
      userid: userId,
      currency: this.addShareForm.get('currency')?.value,
      total_shares_proposed: this.addShareForm.get('total_shares_proposed')
        ?.value,
      unit_price: this.addShareForm.get('unit_price')?.value,
      total_capital_subscribed: this.addShareForm.get(
        'total_capital_subscribed'
      )?.value,
      unpaid_amount: this.addShareForm.get('unpaid_amount')?.value,
      class_of_shares: this.addShareForm.get('class_of_shares')?.value,
      particulars_of_rights: this.addShareForm.get('particulars_of_rights')
        ?.value,
    };

    this.companyService.shareCreation(shareData).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        this.getShareCapitalList();
        this.resetAddShareForm();
      },
      error: (error) => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to create share.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
    });
  }

  initializeEditShareForm() {
    this.editShareForm = this.fb.group({
      class_of_shares: ['Ordinary', Validators.required],
      total_shares_proposed: ['', Validators.required],
      currency: ['HKD', Validators.required],
      unit_price: [null, [Validators.required, Validators.min(0)]],
      total_amount: [{ value: null, disabled: true }],
      total_capital_subscribed: ['', Validators.required],
      unpaid_amount: [{ value: 0, disabled: true }],
      particulars_of_rights: [''],
    });

    // Subscribe to changes in unit price and total shares to calculate total amount
    this.editShareForm.get('unit_price')?.valueChanges.subscribe(() => {
      this.calculateEditTotalAmount();
    });

    this.editShareForm
      .get('total_shares_proposed')
      ?.valueChanges.subscribe(() => {
        this.calculateEditTotalAmount();
      });

    // Subscribe to changes in total amount and total capital subscribed to validate and calculate unpaid amount
    this.editShareForm.get('total_amount')?.valueChanges.subscribe(() => {
      this.calculateEditUnpaidAmount();
    });

    this.editShareForm
      .get('total_capital_subscribed')
      ?.valueChanges.subscribe(() => {
        this.validateEditTotalCapitalSubscribed();
      });

    this.editShareForm.get('unpaid_amount')?.valueChanges.subscribe(() => {
      this.validateEditUnpaidAmount();
    });
  }

  // Calculate total amount based on unit price and total shares
  calculateEditTotalAmount() {
    const unitPrice = this.editShareForm.get('unit_price')?.value || 0;
    const totalShares =
      this.editShareForm.get('total_shares_proposed')?.value || 0;

    const totalAmount = unitPrice * totalShares;
    this.editShareForm
      .get('total_amount')
      ?.setValue(totalAmount.toFixed(2), { emitEvent: false });

    // Ensure totalCapitalSubscribed is valid
    this.validateEditTotalCapitalSubscribed();
  }

  // Calculate unpaid amount for edit form
  calculateEditUnpaidAmount() {
    const totalAmount =
      parseFloat(this.editShareForm.get('total_amount')?.value) || 0;
    let totalCapitalSubscribed =
      parseFloat(this.editShareForm.get('total_capital_subscribed')?.value) ||
      0;

    // Ensure totalCapitalSubscribed does not exceed totalAmount
    if (totalCapitalSubscribed > totalAmount) {
      totalCapitalSubscribed = totalAmount;
      this.editShareForm
        .get('total_capital_subscribed')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }

    let unpaidAmount = totalAmount - totalCapitalSubscribed;
    unpaidAmount = unpaidAmount < 0 ? 0 : unpaidAmount; // Ensure unpaid amount is not negative

    this.editShareForm
      .get('unpaid_amount')
      ?.setValue(unpaidAmount.toFixed(2), { emitEvent: false });
  }

  // Ensure totalCapitalSubscribed does not exceed totalAmount
  validateEditTotalCapitalSubscribed() {
    const totalAmount =
      parseFloat(this.editShareForm.get('total_amount')?.value) || 0;
    let totalCapitalSubscribed =
      parseFloat(this.editShareForm.get('total_capital_subscribed')?.value) ||
      0;

    if (totalCapitalSubscribed > totalAmount) {
      this.editShareForm
        .get('total_capital_subscribed')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }

    this.calculateEditUnpaidAmount();
  }

  // Ensure unpaid amount does not exceed total amount
  validateEditUnpaidAmount() {
    const unpaidAmount =
      parseFloat(this.editShareForm.get('unpaid_amount')?.value) || 0;
    const totalAmount =
      parseFloat(this.editShareForm.get('total_amount')?.value) || 0;

    if (unpaidAmount > totalAmount) {
      this.editShareForm
        .get('unpaid_amount')
        ?.setValue(totalAmount.toFixed(2), { emitEvent: false });
    }
  }

  // Method to handle the edit button click from the table
  editShareCapitalList(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const row = target.closest('tr');
    const shareId = row?.getAttribute('data-id');

    if (shareId) {
      this.currentShareId = shareId;
      this.isSharedsEditing = true;

      // Find the share data from the list
      const shareToEdit = this.shareCapitalList.find(
        (share) => share._id === shareId
      );

      if (shareToEdit) {
        // Initialize the edit form if not already initialized
        if (!this.editShareForm) {
          this.initializeEditShareForm();
        }

        // Populate the form with existing data
        this.editShareForm.patchValue({
          class_of_shares: shareToEdit.share_class,
          total_shares_proposed: shareToEdit.total_share,
          currency: shareToEdit.currency, // Default or fetch from data if available
          unit_price: shareToEdit.amount_share,
          total_capital_subscribed: shareToEdit.total_capital_subscribed,
          particulars_of_rights: shareToEdit.share_right,
        });

        // Calculate total amount and unpaid amount
        this.calculateEditTotalAmount();
        this.calculateEditUnpaidAmount();

        // Open the edit modal
        this.editSharesModalOpen = true;
      }
    }
  }

  // Method to handle the form submission for editing
  updateShareSubmit() {
    const userId = localStorage.getItem('userId');

    // Mark all fields as touched for validation
    Object.keys(this.editShareForm.controls).forEach((key) => {
      const control = this.editShareForm.get(key);
      control?.markAsTouched();
    });

    if (this.editShareForm.invalid) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Please fill in all required fields.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    const updateData = {
      shareId: this.currentShareId,
      companyId: this.companyId,
      userid: userId,
      currency: this.editShareForm.get('currency')?.value,

      total_shares_proposed: this.editShareForm.get('total_shares_proposed')
        ?.value,
      unit_price: this.editShareForm.get('unit_price')?.value,
      total_capital_subscribed: this.editShareForm.get(
        'total_capital_subscribed'
      )?.value,
      unpaid_amount: this.editShareForm.get('unpaid_amount')?.value,
      class_of_shares: this.editShareForm.get('class_of_shares')?.value,
      particulars_of_rights: this.editShareForm.get('particulars_of_rights')
        ?.value,
    };

    this.companyService.updateShare(updateData).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        this.getShareCapitalList();
        this.closeShareEditModal();
      },
      error: (error) => {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to update share.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
    });
  }

  // Method to close the edit modal and reset form
  closeShareEditModal() {
    console.log('hahahaha');

    this.editSharesModalOpen = false;
    this.isSharedsEditing = false;
    this.currentShareId = '';
    this.editShareForm.reset();
  }

  // Method to handle the delete button click
  deleteShareCapitalList(shareId: string) {
    // Show confirmation dialog before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call service to delete the share
        this.companyService.deleteShare(shareId, this.companyId).subscribe({
          next: (response) => {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: response.message,
              toast: true,
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            });
            // Refresh the list after deletion
            console.log('response', response);
            this.getShareCapitalList();
          },
          error: (error) => {
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Error',
              text: error.message || 'Failed to delete share.',
              toast: true,
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
            this.getShareCapitalList();
          },
        });
      }
    });
  }

  openEditModal(shareholder: any) {
    this.selectedShareholder = shareholder;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedShareholder = null;
  }

  onShareholderUpdated(updatedShareholder: any) {
    // Update the shareholder in the local array
    const index = this.shareholders.findIndex(
      (s) => s._id === updatedShareholder._id
    );
    if (index !== -1) {
      this.shareholders[index] = {
        ...this.shareholders[index],
        ...updatedShareholder,
      };
    }

    // Refresh the list from the server
    this.getShareHoldersList();
  }

  resetAddShareForm() {
    this.addShareForm.reset({
      class_of_shares: '',
      total_shares_proposed: '',
      currency: 'HKD',
      unit_price: null,
      total_amount: { value: null, disabled: true },
      total_capital_subscribed: '',
      unpaid_amount: { value: 0, disabled: true },
      particulars_of_rights: '',
    });

    this.addShareForm.get('total_amount')?.enable();
    this.addShareForm.get('unpaid_amount')?.enable();

    this.initializeAddSharesForm();
  }

  toggleShareHoldersForm() {
    console.log(this.showForm);
    this.isShareholderFormVisible = !this.isShareholderFormVisible;
    this.showForm = !this.showForm;
  }

  toggleShareHoldersInviteForm() {
    this.inviteShareHolderForm = !this.inviteShareHolderForm;
    this.showInviteForm = !this.showInviteForm;
  }

  initializeSharesHoldersForm() {
    const isInvitedValue =
      this.route.snapshot.queryParams['isInvited'] === 'true';
    if (isInvitedValue == true) {
      this.isInvited = isInvitedValue;
    }
    this.shareHoldersForm = this.fb.group({
      surname: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      chineeseName: ['', [Validators.minLength(3)]],
      idNo: [''],
      isInvited: [isInvitedValue],
      idProof: [null],
      userType: ['person', Validators.required],
      address: ['', [Validators.required, Validators.minLength(3)]],
      building: ['', Validators.minLength(4)],
      district: ['', Validators.minLength(4)],
      street: ['', Validators.minLength(4)],
      addressProof: [null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(8),
        ],
      ],
      countryCode: [''],
      shareDetails: this.fb.group([{
        shareDetailsNoOfShares: ['', Validators.required],
        shareDetailsClassOfShares: ['', Validators.required],
      }]),
    });

    this.shareHoldersForm
      .get('userType')
      ?.valueChanges.subscribe((userType) => {
        this.updateFormValidation(userType);
      });
  }

  get shareDetailsNoOfShares() {
    return this.shareHoldersForm.get('shareDetails.shareDetailsNoOfShares');
  }

  get shareDetailsClassOfShares() {
    return this.shareHoldersForm.get('shareDetails.shareDetailsClassOfShares');
  }

  updateFormValidation(userType: string) {
    const surnameControl = this.shareHoldersForm.get('surname');
    const chineseNameControl = this.shareHoldersForm.get('chineeseName');
    const idNoControl = this.shareHoldersForm.get('idNo');
    const addressProofControl = this.shareHoldersForm.get('addressProof');

    if (userType === 'company') {
      surnameControl?.clearValidators();
      surnameControl?.setValue(''); // Clear the value
      chineseNameControl?.clearValidators();
      chineseNameControl?.setValue(''); // Clear the value
      this.shareHoldersForm.get('name')?.setValidators([Validators.required]);

      // Remove validation for address proof
      addressProofControl?.clearValidators();
      addressProofControl?.setValue('');
    } else {
      surnameControl?.setValidators([
        Validators.required,
        Validators.minLength(3),
      ]);
      this.shareHoldersForm
        .get('name')
        ?.setValidators([Validators.required, Validators.minLength(3)]);

      // Restore validation for address proof
      addressProofControl?.setValidators([Validators.required]);
    }

    surnameControl?.updateValueAndValidity();
    chineseNameControl?.updateValueAndValidity();
    idNoControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity(); // Ensure validation updates
  }

  getFormValidationErrors() {
    const formErrors: any = {};
    Object.keys(this.shareHoldersForm.controls).forEach((key) => {
      const controlErrors = this.shareHoldersForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  shareHoldersFormSubmit() {
    console.log('=== FORM SUBMISSION STARTED ===');
    this.isShareLoading = true;

    // Form validation
    Object.keys(this.shareHoldersForm.controls).forEach((key) => {
      this.shareHoldersForm.get(key)?.markAsTouched();
    });

    // Validate share rows
    if (!this.validateShareRows()) {
      this.isShareLoading = false;
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Please select at least one share class with a valid amount.',
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    // Debug: Log form status and errors
    console.log('Form valid:', this.shareHoldersForm.valid);
    console.log('Form values:', this.shareHoldersForm.value);
    console.log('Share rows:', this.shareRows);

    const formErrors = this.getFormValidationErrors();
    console.log('Form validation errors:', formErrors);

    if (this.shareHoldersForm.invalid) {
      this.isShareLoading = false;
      const firstInvalidElement = document.querySelector('.error-message');
      firstInvalidElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    // Get user and company IDs
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      this.isShareLoading = false;
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    // Get companyId from localStorage if not set
    if (!this.companyId) {
      const savedCompanyId = localStorage.getItem('companyId');
      if (!savedCompanyId) {
        this.isShareLoading = false;
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Company ID not found. Please select a company first.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        return;
      }
      this.companyId = savedCompanyId;
      console.log('Using company ID from localStorage:', this.companyId);
    }

    // Filter out valid share rows
    const validShareRows = this.shareRows.filter(
      (row) =>
        row.shareClass && row.unpaidAmount !== null && row.unpaidAmount > 0
    );

    // Create form data with share rows included
    const formData = {
      ...this.shareHoldersForm.value,
      shareRows: validShareRows, // Include the share rows data
      userId,
      companyId: this.companyId,
    };

    // Submit form
    this.companyService.shareHoldersCreation(formData).subscribe({
      next: (response) => {
        this.isShareLoading = false;

        console.log('Shareholder created successfully:', response);
        this.showForm = !this.showForm;
        this.isShareholderFormVisible = !this.isShareholderFormVisible;

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        // Reset form and UI
        this.shareHoldersForm.reset();
        this.addressProofPreview = null;
        this.idProofPreview = null;
        this.currentHolder = formData;

        // Reset share rows
        this.shareRows = [{ shareClass: '', unpaidAmount: null }];

        this.initializeSharesHoldersForm();

        // Refresh shareholder list
        this.getShareHoldersList();

        // Redirect if not company secretary
        if (userRole !== 'Company Secretary') {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Submission Successful!',
            text: 'Redirecting to your dashboard...',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          }).then(() => {
            this.router.navigate(['/user-dashboard']);
          });
        }
      },
      error: (error) => {
        this.isShareLoading = false;
        console.error('Error creating shareholder:', error);

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error?.message || 'Error creating shareholder',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
    });
  }

  deleteShareholder(shareholderId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteShareholder(shareholderId).subscribe({
          next: (response) => {
            Swal.fire('Deleted!', response.message, 'success');
            this.getShareHoldersList(); // Refresh the list
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              error.message || 'Failed to delete shareholder.',
              'error'
            );
          },
        });
      }
    });
  }

  onImageSelectedAddress(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.addressProofPreview = reader.result as string;
        console.log('Base64 address proof:', this.addressProofPreview);

        this.shareHoldersForm.patchValue({
          addressProof: this.addressProofPreview,
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.addressProofPreview = null;
      this.shareHoldersForm.patchValue({ addressProof: null });
    }
  }

  onSelectIDProofImage(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.idProofPreview = reader.result as string;
        console.log('Base64 ID proof:', this.idProofPreview);

        this.shareHoldersForm.patchValue({
          idProof: this.idProofPreview,
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.idProofPreview = null;
      this.shareHoldersForm.patchValue({ idProof: null });
    }
  }

  clearForm() {
    this.shareHoldersForm.reset();
  }

  getShareCapitalList() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }
    const savedCompanyId = localStorage.getItem('companyId');

    if (!savedCompanyId) {
      console.error('Company ID is missing in localStorage!');
      return;
    }

    // Ensure companyId is correctly set before adding it to formData
    this.companyId = savedCompanyId;
    console.log('this.companyId ', this.companyId);

    this.companyService.getShareCapitalList(this.companyId, userId).subscribe({
      next: (response) => {
        console.log('Share capital list fetched successfully:', response);
        this.shareCapitalList = response.data;
        console.log('Share Capital List:', this.shareCapitalList);

        this.selectedShareUnpaidAmount = '';
      },
      error: (error) => {
        console.error('Error fetching share capital list:', error);
        this.shareCapitalList = [];

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.error?.message || 'Empty Share capital / Not Found',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
    });
  }

  // onShareClassChange(event: any) {
  //   const selectedShareClass = event.target.value;

  //   if (selectedShareClass) {
  //     const selectedShare = this.shareCapitalList.find(
  //       share => share.share_class === selectedShareClass
  //     );

  //     if (selectedShare) {
  //       this.selectedShareUnpaidAmount = selectedShare.unpaid_amount;

  //       // 👇 Update the form control directly
  //       const control = this.inviteShareholderForm.get(['shareDetails', 0, 'noOfShares']);
  //       if (control) {
  //         control.setValue(this.selectedShareUnpaidAmount);
  //       }
  //     }
  //   } else {
  //     this.selectedShareUnpaidAmount = '';
  //     const control = this.inviteShareholderForm.get(['shareDetails', 0, 'noOfShares']);
  //     if (control) {
  //       control.setValue(null);
  //     }
  //   }
  // }

  // onShareClassChange(event: any, index: number): void {
  //   const selectedClass = event.target.value;
  //   const selectedShare = this.shareCapitalList.find(
  //     share => share.share_class === selectedClass
  //   );

  //   if (selectedShare) {
  //     this.shareRows[index].unpaidAmount = selectedShare.unpaid_amount;
  //   } else {
  //     this.shareRows[index].unpaidAmount = null;
  //   }
  // }

  // onShareClassChange1(event: any) {
  //   const selected = this.shareCapitalList.find(
  //     item => item.share_class === event.target.value
  //   );
  //   this.selectedUnpaidAmount1 = selected ? selected.unpaid_amount : null;
  // }

  // onShareClassChange2(event: any) {
  //   const selected = this.shareCapitalList.find(
  //     item => item.share_class === event.target.value
  //   );
  //   this.selectedUnpaidAmount2 = selected ? selected.unpaid_amount : null;
  // }

  // deleteShareCapitalList(id: string) {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.companyService.deleteShareCapital(id).subscribe({
  //         next: (response) => {
  //           console.log('Share capital deleted:', response.message);

  //           Swal.fire({
  //             position: 'top-end',
  //             icon: 'success',
  //             title: response.message || 'Share capital deleted successfully!',
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1500,
  //             timerProgressBar: true,
  //           });

  //           this.getShareCapitalList();
  //         },
  //         error: (error) => {
  //           console.error('Error deleting share capital:', error);

  //           Swal.fire({
  //             position: 'top-end',
  //             icon: 'error',
  //             title: error.message || 'Failed to delete share capital.',
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1500,
  //             timerProgressBar: true,
  //           });
  //         },
  //       });
  //     }
  //   });
  // }

  // onShareClassChange(event: any) {
  //   const selectedShareClass = event.target.value;

  //   if (selectedShareClass) {
  //     const selectedShare = this.shareCapitalList.find(
  //       share => share.share_class === selectedShareClass
  //     );

  //     if (selectedShare) {
  //       this.selectedShareUnpaidAmount = selectedShare.unpaid_amount;
  //     }
  //   } else {
  //     this.selectedShareUnpaidAmount = null;
  //   }
  // }

  getShareHoldersList() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'User ID not found. Please log in again.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    // Get companyId from localStorage
    const savedCompanyId = localStorage.getItem('companyId');

    if (!savedCompanyId) {
      console.error('Company ID is missing in localStorage!');
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Company ID not found. Please select a company first.',
        toast: true,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    // Set loading state if you have one
    // this.isLoading = true;

    console.log('Fetching shareholders for company:', savedCompanyId);

    this.companyService.getShareHoldersList(savedCompanyId, userId).subscribe({
      next: (response) => {
        // this.isLoading = false;

        if (response && response.data) {
          this.shareholders = response.data;
          console.log(
            'Shareholders loaded:',
            this.shareholders.length,
            this.shareholders
          );

          // Optional success notification
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `${this.shareholders.length} shareholders loaded`,
            toast: true,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error) => {
        // this.isLoading = false;
        console.error('Error fetching shareholders:', error);

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to fetch shareholders list.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
    });
  }

  invateShareHoldersButton() {
    this.invateShareHolderForm = !this.invateShareHolderForm;
  }

  viewShareDetails(shareholder: any) {
    // Set the selected shareholder
    this.selectedShareholder = shareholder;

    // Show the modal
    this.isViewModalOpen = true;
  }

  closeShareModal() {
    this.isViewModalOpen = false;
  }

  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Excluding l and o to avoid confusion
    const numbers = '23456789'; // Excluding 0 and 1 to avoid confusion

    const allChars = uppercase + lowercase + numbers;
    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  initializeInvateSharesHoldersForm() {
    this.inviteShareholderForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: [''],
      shareDetails: this.fb.group([{
        shareDetailsNoOfShares: ['', Validators.required],
        shareDetailsClassOfShares: ['', Validators.required],
      }]),
    });
  }

  get inviteShareDetailsNoOfShares() {
    return this.inviteShareholderForm.get('shareDetails.shareDetailsNoOfShares');
  }

  get inviteShareDetailsClassOfShares() {
    return this.inviteShareholderForm.get('shareDetails.shareDetailsClassOfShares');
  }

  invateShareHoldersSubmit() {
    console.log(this.inviteShareholderForm.value);
    if (this.inviteShareholderForm.invalid) {
      this.inviteShareholderForm.markAllAsTouched();
      return;
    }
    this.isInviteLoading = true;

    const userId = localStorage.getItem('userId');
    const savedCompanyId = localStorage.getItem('companyId');

    if (!savedCompanyId) {
      console.error('Company ID is missing in localStorage!');
      return;
    }

    // Ensure companyId is correctly set before adding it to formData
    this.companyId = savedCompanyId;

    const validShareRows = this.shareRows2.filter(
      (row) =>
        row.shareClass && row.unpaidAmount !== null && row.unpaidAmount > 0
    );

    console.log(validShareRows)

    const formData = {
      ...this.inviteShareholderForm.value,
      password: this.generateSecurePassword(),
      shareRows: validShareRows,
      userId: userId,
      companyId: this.companyId,
    };

    console.log(formData);

    this.companyService.InvateshareHoldersCreation(formData).subscribe({
      next: (response) => {
        console.log('Shareholder invitation successful:', response.message);
        this.invateShareHolderForm = !this.inviteShareHolderForm;

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Invitation Sent!',
          toast: true,
          text: `The invitation to ${formData.name} has been sent successfully!`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        this.isInviteLoading = false;

        this.inviteShareholderForm.reset();
        this.addressProofPreview = null;
        this.idProofPreview = null;
        this.getShareHoldersList();
      },
      error: (error) => {
        console.error('Error occurred during share creation:', error);
        this.isInviteLoading = true;

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
    });
  }

  clearInvateShareHoldersForm() {
    this.inviteShareholderForm.reset();
  }

  getErrorMessage3(controlName: string): string {
    const control = this.inviteShareholderForm.get(controlName);

    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) {
        return `${controlName} is required.`;
      }
    }
    return '';
  }

  toggleDirectorsInfo() {
    this.directorsInfoOpen = !this.directorsInfoOpen;
  }

  initializeDirectorInfoForm() {
    // const isInvitedValue = this.route.snapshot.queryParams['isInvited'] === 'true';
    const isInvitedValue =
      this.route.snapshot.queryParams['isInvited'] === 'true';
    if (isInvitedValue == true) {
      this.isInvited = isInvitedValue;
    }
    this.directorInformationForm = this.fb.group({
      type: ['person', Validators.required],
      surname: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      chineeseName: ['', Validators.minLength(4)],
      idNo: [''],
      isInvited: [isInvitedValue],
      idProof: [null],

      address: ['', Validators.minLength(3)],
      street: ['', Validators.minLength(4)],
      building: ['', Validators.minLength(4)],
      district: ['', Validators.minLength(4)],
      addressProof: [null],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
      ]],
      countryCode: ['+91', Validators.required],
    });

    this.directorInformationForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateFormValidation1(type);
    });
  }

  updateFormValidation1(type: string) {
    console.log('User type changed to:', type);
    const surnameControl = this.directorInformationForm.get('surname');
    const chineseNameControl = this.directorInformationForm.get('chineeseName');
    const idNoControl = this.directorInformationForm.get('idNo');
    const addressProofControl =
      this.directorInformationForm.get('addressProof');

    if (type === 'company') {
      surnameControl?.clearValidators();
      surnameControl?.setValue('');
      chineseNameControl?.clearValidators();
      chineseNameControl?.setValue('');
      this.directorInformationForm
        .get('name')
        ?.setValidators([Validators.required, Validators.minLength(3)]);

      // Remove validation for address proof
      addressProofControl?.clearValidators();
      addressProofControl?.setValue('');
    } else {
      surnameControl?.setValidators([
        Validators.required,
        Validators.minLength(3),
      ]);
      this.directorInformationForm
        .get('name')
        ?.setValidators([Validators.required, Validators.minLength(3)]);

      // Restore validation for address proof
      addressProofControl?.setValidators([Validators.required]);
    }

    surnameControl?.updateValueAndValidity();
    chineseNameControl?.updateValueAndValidity();
    idNoControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity(); // Ensure validation updates
  }

  getErrorMessage4(controlName: string): string {
    const control = this.directorInformationForm.get(controlName);

    if (control?.errors && (control.dirty || control.touched)) {
      // Format the control name for display
      const formattedName = controlName
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

      if (control.errors['required']) {
        return `${formattedName} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control?.hasError('pattern')) {
        return `${formattedName} must be exactly 8 digits long.`; // Updated message for HK phone numbers
      }
      if (control.errors['minlength']) {
        return `${formattedName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  imagePreviewOnDirectorsIDProof(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imagePreviewDirectorsId = e.target?.result as
          | string
          | ArrayBuffer
          | null;
      };

      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          this.directorInformationForm.patchValue({
            idProof: result,
          });
          console.log('Base64 String:', result);
        } else {
          console.error('Result is not a string:', result);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  imagePreviewOnDirectorsAddressProof(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64AddressProof = reader.result as string;
        console.log('Base64 address proof:', base64AddressProof);

        this.addressProofDirectors = base64AddressProof;
      };

      reader.readAsDataURL(file);
    } else {
      this.addressProofDirectors = null;
    }
  }

  directorFormSubmission() {
    // Set loading state to true at the beginning
    this.isDirectorLoading = true;

    // Mark all fields as touched to trigger validation messages
    Object.keys(this.directorInformationForm.controls).forEach((key) => {
      const control = this.directorInformationForm.get(key);
      control?.markAsTouched();
    });

    if (this.directorInformationForm.invalid) {
      // Reset loading state if form is invalid
      this.isDirectorLoading = false;

      // Scroll to first error message
      const firstInvalidElement = document.querySelector('.error-message');
      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const companyId = this.companyId;

    const formData = {
      ...this.directorInformationForm.value,
      addressProof: this.addressProofDirectors,
      userId: userId,
      companyId: companyId,
    };

    console.log('Submitting director form data:', formData);

    this.companyService.DirectorInfoCreation(formData).subscribe({
      next: (response) => {
        // Reset loading state on success
        this.isDirectorLoading = false;
        this.directorsInfoOpen = !this.directorsInfoOpen;

        console.log('Director creation successful:', response.message);

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        // Reset form and clear previews
        this.directorInformationForm.reset();
        this.fetchDirectorsInfo();
        this.imagePreviewDirectorsAddressProof = null;
        this.imagePreviewDirectorsId = null;
        if (userRole !== 'Company Secretary') {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Submission Successful!',
            text: 'Redirecting to your dashboard...',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          }).then(() => {
            this.router.navigate(['/user-dashboard']); // Redirect
          });
        }
      },
      error: (error) => {
        // Reset loading state on error
        this.isDirectorLoading = false;

        console.error(
          'Error occurred during director information creation:',
          error
        );

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title:
            error.message ||
            'An error occurred while creating director information',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
    });
  }
  fetchDirectorsInfo(): void {
    const userId = localStorage.getItem('userId');
    // const companyId = this.companyId;
    if (!this.companyId) {
      const savedCompanyId = localStorage.getItem('companyId');
      if (savedCompanyId) {
        this.companyId = savedCompanyId;
        console.log('found saved one', this.companyId);
      }
    }
    console.log('for director infor', this.companyId);

    if (!userId) {
      console.error('Error: User ID is not found in localStorage');
      return;
    }

    this.companyService.getDirectorsInfo(this.companyId, userId).subscribe({
      next: (response) => {
        this.directorsInformation = response.data;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Directors list fetched successfully.',
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        this.initializeDirectorInfoForm();
      },
      error: (err) => {
        console.error('Error fetching directors info:', err.message);
      },
    });
  }
  openDirectorEditModal(director: any) {
    this.selectedDirector = director;
    this.isDirectorEditModalOpen = true;
  }

  closeDirectorEditModal() {
    this.isDirectorEditModalOpen = false;
    this.selectedDirector = null;
  }

  onDirectorUpdated(updatedDirector: any) {
    const index = this.directorsInformation.findIndex(
      (d) => d._id === updatedDirector._id
    );
    if (index !== -1) {
      this.directorsInformation[index] = {
        ...this.directorsInformation[index],
        ...updatedDirector,
      };
    }
    this.fetchDirectorsInfo();
  }

  OnDeleteDirectorInfo(directorId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteDirector(directorId).subscribe({
          next: (response) => {
            console.log('Director deleted successfully:', response);
            this.directorsInformation = this.directorsInformation.filter(
              (director) => director._id !== directorId
            );

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'The director has been deleted.',
              toast: true,
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
          },
          error: (error) => {
            console.error('Error deleting director:', error.message);

            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'Failed to delete the director. Please try again.',
              toast: true,
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
          },
        });
      }
    });
  }

  // OnDeleteDirectorInfo(directorId: string): void {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'You won\'t be able to revert this!',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.companyService.deleteDirector(directorId).subscribe({
  //         next: (response) => {
  //           console.log('Director deleted successfully:', response);
  //           this.directorsInformation = this.directorsInformation.filter(
  //             (director) => director._id !== directorId
  //           );

  //           Swal.fire({
  //             position: 'top-end',
  //             icon: 'success',
  //             title: 'The director has been deleted.',
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1500,
  //             timerProgressBar: true,
  //           });
  //         },
  //         error: (error) => {
  //           console.error('Error deleting director:', error.message);

  //           Swal.fire({
  //             position: 'top-end',
  //             icon: 'error',
  //             title: 'Failed to delete the director. Please try again.',
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1500,
  //             timerProgressBar: true,
  //           });
  //         },
  //       });
  //     }
  //   });
  // }

  openDirectorInvateForm() {
    this.directorInvateOpen = !this.directorInvateOpen;
  }

  initializeInvateDirectorForm() {
    this.InviteDirectorsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      classOfShares: [''],
      noOfShares: [''],
    });
  }

  getErrorMessage5(controlName: string): string {
    const control = this.InviteDirectorsForm.get(controlName);
    if (control && (control.touched || control.dirty)) {
      if (control?.hasError('required')) {
        return `${controlName} is required`;
      }
      if (control?.hasError('email')) {
        return 'Enter a valid email address';
      }
      if (control?.hasError('minlength')) {
        return `Minimum length is 3 characters`;
      }
      if (control?.hasError('min')) {
        return `Value must be greater than 0`;
      }
    }
    return '';
  }

  invateDirectorSubmit(): void {
    Object.keys(this.InviteDirectorsForm.controls).forEach((key) => {
      const control = this.InviteDirectorsForm.get(key);
      control?.markAsTouched();
    });

    if (this.InviteDirectorsForm.valid) {
      this.isInviteLoading = true;
      const userId = localStorage.getItem('userId');
      const companyId = this.companyId;
      const formData = this.InviteDirectorsForm.value;

      const data = {
        ...formData,
        userId: userId,
        companyId: companyId,
        password: this.generateSecurePassword(),
      };

      this.companyService.directorInviteCreation(data).subscribe({
        next: (response) => {
          console.log('director creation created', response);
          this.isInviteLoading = false;
          this.invitedDirectors.push(this.InviteDirectorsForm.value)

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Invitation Sent!',
            toast: true,
            text: `The invitation to ${formData.name} has been sent successfully!`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          this.directorInvateOpen = false;

          this.InviteDirectorsForm.reset();
        },
        error: (error) => {
          this.isInviteLoading = false;
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: error.message || 'Failed to send invitation email.',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  getInvideDirectosList() {
    const userId = localStorage.getItem('userId');
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      this.companyService.directorsInvites(companyId).subscribe({
        next: (response) => {
          this.invitedDirectors = response.data;
          console.log('invited directors', this.invitedDirectors);
        },
        error: (error) => {
          console.error('Error fetching invited directors:', error);
        }
      })
    }
  }

  initializeCompanySecretaryForm() {
    this.comapnySecretaryForm = this.fb.group({
      tcspLicenseNo: ['', [Validators.required]],
      tcspReason: [''],
      type: ['person', Validators.required],
      surname: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      chineeseName: [''],
      idNo: [''],
      idProof: [null],
      address: ['', [Validators.minLength(3)]],
      street: [''],
      building: [''],
      district: [''],
      addressProof: [null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8)],
      countryCode: ['+91', Validators.required],
    });
    this.comapnySecretaryForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateFormValidation3(type);
    });
  }

  updateFormValidation3(type: string) {
    const surnameControl = this.comapnySecretaryForm.get('surname');
    const idNoControl = this.comapnySecretaryForm.get('idNo');
    const addressProofControl = this.comapnySecretaryForm.get('addressProof');

    if (type === 'company') {
      surnameControl?.clearValidators();
      surnameControl?.setValue('');
      addressProofControl?.clearValidators(); // Remove validation for address proof
      addressProofControl?.setValue(''); // Remove validation for address proof
    } else {
      surnameControl?.setValidators([
        Validators.required,
        Validators.minLength(3),
      ]);
      addressProofControl?.setValidators([]); // Restore validation for address proof
    }

    surnameControl?.updateValueAndValidity();
    idNoControl?.updateValueAndValidity();
    addressProofControl?.updateValueAndValidity(); // Ensure validation updates
  }

  fieldLabels: { [key: string]: string } = {
    tcspLicenseNo: 'TCSP License Number',
    tcspReason: 'TCSP Reason',
    type: 'Company Secretary Type',
    surname: 'Surname',
    name: 'Name',
    chineeseName: 'Chinese Name',
    idNo: 'ID Number',
    idProof: 'ID Proof',
    address: 'Address',
    street: 'Street',
    building: 'Building',
    district: 'District',
    addressProof: 'Address Proof',
    email: 'Email',
    phone: 'Phone Number',
  };

  getErrorMessage6(controlName: string): string {
    const control = this.comapnySecretaryForm.get(controlName);
    const label = this.fieldLabels[controlName] || controlName; // Get user-friendly label

    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return `${label} is required.`;
      }
      if (control.errors['email']) {
        return `Please enter a valid email address.`;
      }
      if (control?.hasError('pattern')) {
        return `${label} must be exactly 8 digits long.`; // Updated message for HK phone numbers
      }
      if (control.errors['minlength']) {
        return `${label} must be at least ${control.errors['minlength'].requiredLength} characters long.`;
      }
    }
    return '';
  }

  comapnySecretarySubmission() {
    console.log(this.comapnySecretaryForm.value);
    Object.keys(this.comapnySecretaryForm.controls).forEach((key) => {
      const control = this.comapnySecretaryForm.get(key);
      control?.markAsTouched();
    });
    this.isSubmitLoading = true;

    if (this.comapnySecretaryForm.invalid) {
      this.comapnySecretaryForm.markAllAsTouched();
      this.isSubmitLoading = false;
      return;
    }

    const userId = localStorage.getItem('userId');
    const companyId = this.companyId;

    const formData = {
      ...this.comapnySecretaryForm.value,
      addressProof: this.imagePreviewCompanySecretaryAddressProof,
      userId: userId,
      companyId: companyId,
    };

    this.companyService.companySecretaryCreation(formData).subscribe({
      next: (response) => {
        console.log(
          'Company Secretary information successfully added:',
          response.message
        );
        this.isSubmitLoading = false;
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        this.comapnySecretaryForm.reset();
        this.router.navigate(['/summary', companyId]);
        this.updateCurrentStage(companyId, 4);
        this.imagePreviewCompanySecretaryAddressProof = null;
        this.imagePreviewCompanySecretaryId = null;
      },
      error: (error) => {
        console.error(
          'Error occurred during company Secretary information creation:',
          error
        );
        this.isSubmitLoading = false;

        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: error.message,
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      },
    });
  }

  imagePreviewOnCompanySecretaryIDProof(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imagePreviewCompanySecretaryId = e.target?.result as
          | string
          | ArrayBuffer
          | null;
      };

      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          this.comapnySecretaryForm.patchValue({
            idProof: result,
          });
          console.log('Base64 String:', result);
        } else {
          console.error('Result is not a string:', result);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  // getErrorMessage6(controlName: string): string {
  //   const control = this.comapnySecretaryForm.get(controlName);

  //   const fieldNames: { [key: string]: string } = {
  //     tcspLicenseNo: 'TCSP License Number',
  //     tcspReason: 'TCSP Reason',
  //     type: 'Type',
  //     surname: 'Surname',
  //     name: 'Name',
  //     chineeseName: 'Chinese Name',
  //     idProof: 'ID Proof',
  //     address: 'Address',
  //     street: 'Street',
  //     building: 'Building',
  //     district: 'District',
  //     addressProof: 'Address Proof',
  //     email: 'Email',
  //     phone: 'Phone',
  //   };

  //   const fieldLabel = fieldNames[controlName] || controlName;

  //   if (control?.errors && (control.touched || control.dirty)) {
  //     if (control.hasError('required')) {
  //       return `${fieldLabel} is required.`;
  //     }
  //     if (control.hasError('minlength')) {
  //       return `${fieldLabel} must be at least ${control.getError('minlength').requiredLength} characters long.`;
  //     }
  //     if (control.hasError('email')) {
  //       return 'Enter a valid email address.';
  //     }
  //     if (control.hasError('pattern')) {
  //       return `${fieldLabel} must be exactly 10 digits long.`;
  //     }
  //   }
  //   return '';
  // }

  imagePreviewOnCompanySecretaryAddressProof(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64AddressProof = reader.result as string;

        this.imagePreviewCompanySecretaryAddressProof = base64AddressProof;
      };

      reader.readAsDataURL(file);
    } else {
      this.imagePreviewCompanySecretaryAddressProof = null;
    }
  }

  // 5. Updated method to add share rows with better initialization
  addShareRow1() {
    this.shareRows.push({
      shareClass: '',
      unpaidAmount: null,
    });

  }

  // 6. Updated method to remove share rows with better validation sync
  removeShareRow1(index: number) {
    if (this.shareRows.length > 1) {
      this.shareRows.splice(index, 1);

      // If we removed the first row, sync the new first row with form validation
      if (index === 0 && this.shareRows.length > 0) {
        this.shareHoldersForm.patchValue({
          shareDetailsClassOfShares: this.shareRows[0].shareClass,
          shareDetailsNoOfShares: this.shareRows[0].unpaidAmount,
        });
      } else if (this.shareRows.length === 0) {
        // If no rows left, clear form fields
        this.shareHoldersForm.patchValue({
          shareDetailsClassOfShares: '',
          shareDetailsNoOfShares: null,
        });
      }
    } else {
      // If it's the last row, just clear its values
      this.shareRows[0] = { shareClass: '', unpaidAmount: null };
      this.shareHoldersForm.patchValue({
        shareDetailsClassOfShares: '',
        shareDetailsNoOfShares: null,
      });
    }

    console.log('Removed share row. Remaining rows:', this.shareRows.length);
  }

  onShareAmountChange(amount: any, index: number): void {
    // Convert to number and handle empty strings
    const numericAmount =
      amount === '' || amount === null ? null : Number(amount);

    this.shareRows[index].unpaidAmount = numericAmount;

    // Sync the first row to form fields for validation
    if (index === 0) {
      this.shareHoldersForm.patchValue({
        shareDetailsNoOfShares: numericAmount,
      });
      this.shareHoldersForm.get('shareDetailsNoOfShares')?.markAsTouched();
    }

    console.log('Share amount updated for row', index, ':', numericAmount);
    console.log(
      'Form noOfShares value:',
      this.shareHoldersForm.get('shareDetailsNoOfShares')?.value
    );
  }

  onShareClassChange(event: any, index: number): void {
    const selectedClass = event.target.value;
    const selectedShare = this.shareCapitalList.find(
      (share) => share.share_class === selectedClass
    );

    // Update the row data
    this.shareRows[index].shareClass = selectedClass;

    if (selectedShare) {
      // Auto-populate the unpaid amount from share capital
      this.shareRows[index].unpaidAmount = selectedShare.unpaid_amount;
    } else {
      this.shareRows[index].unpaidAmount = null;
    }

    // Sync the first row to form fields for validation (this is crucial)
    if (index === 0) {
      this.shareHoldersForm.patchValue({
        shareDetailsClassOfShares: this.shareRows[0].shareClass,
        shareDetailsNoOfShares: this.shareRows[0].unpaidAmount,
      });
    }

    // Mark the form controls as touched to trigger validation
    this.shareHoldersForm.get('shareDetailsClassOfShares')?.markAsTouched();
    this.shareHoldersForm.get('shareDetailsNoOfShares')?.markAsTouched();

    console.log('Share row updated:', this.shareRows[index]);
    console.log('Form values after sync:', {
      classOfShares: this.shareHoldersForm.get('shareDetailsClassOfShares')
        ?.value,
      noOfShares: this.shareHoldersForm.get('shareDetailsNoOfShares')?.value,
    });
  }

  // 3. Add a method to validate share rows
  validateShareRows(): boolean {
    // Check if at least one share row has both class and amount
    const validRows = this.shareRows.filter(
      (row) =>
        row.shareClass && row.unpaidAmount !== null && row.unpaidAmount > 0
    );

    return validRows.length > 0;
  }

  // Methods for second form
  addShareRow2() {
    this.shareRows2.push({
      shareClass: '',
      unpaidAmount: null,
    });
  }

  removeShareRow2(index: number) {
    if (this.shareRows2.length > 1) {
      this.shareRows2.splice(index, 1);
    }
  }

  onShareClassChange2(event: any, index: number): void {
    const selectedClass = event.target.value;

    const selectedShare = this.shareCapitalList.find(
      (share) => share.share_class === selectedClass
    );

    this.shareRows2[index].shareClass = selectedClass;

    if (selectedShare) {
      this.shareRows2[index].unpaidAmount = selectedShare.unpaid_amount;
    } else {
      this.shareRows2[index].unpaidAmount = null;
    }

    if (index === 0) {
      this.inviteShareholderForm.patchValue({
        shareDetailsClassOfShares: this.shareRows2[0].shareClass,
        shareDetailsNoOfShares: this.shareRows2[0].unpaidAmount,
      });

      this.inviteShareholderForm.get('shareDetailsClassOfShares')?.markAsTouched();
      this.inviteShareholderForm.get('shareDetailsNoOfShares')?.markAsTouched();
    }
  }

  onShareAmountChange2(amount: any, index: number): void {
    const numericAmount = amount === '' || amount === null ? null : Number(amount);

    this.shareRows2[index].unpaidAmount = numericAmount;

    if (index === 0) {
      this.inviteShareholderForm.patchValue({
        shareDetailsNoOfShares: numericAmount,
      });
      this.inviteShareholderForm.get('shareDetailsNoOfShares')?.markAsTouched();
    }
  }


  // Keep your existing individual functions if still needed
  onShareClassChange1(event: any) {
    const selected = this.shareCapitalList.find(
      (item) => item.share_class === event.target.value
    );
    this.selectedUnpaidAmount1 = selected ? selected.unpaid_amount : null;
  }

  // 7. Method to clear all share rows
  clearAllForms1() {
    this.shareRows = [{ shareClass: '', unpaidAmount: null }];

    // Clear form validation fields
    this.shareHoldersForm.patchValue({
      shareDetailsClassOfShares: '',
      shareDetailsNoOfShares: '',
    });
  }

  // Add this method to your component (call it in ngOnInit after initializeSharesHoldersForm)
  initializeShareRows() {
    // Initialize with one empty share row if not already initialized
    if (!this.shareRows || this.shareRows.length === 0) {
      this.shareRows = [{ shareClass: '', unpaidAmount: null }];
    }

    console.log('Share rows initialized:', this.shareRows);
  }

  clearAllForms2() {
    this.shareRows2 = [{ shareClass: '', unpaidAmount: null }];
  }

  // Add this method to your component
  loadCompanyData() {
    if (this.companyId) {
      this.companyService.getComapnyInfo(this.companyId).subscribe({
        next: (response: any) => {
          if (response) {
            // Populate the company form with existing data
            this.companyInfoForm.patchValue({
              companyNameEN: response.business_name,
              companyNameCN: response.business_name_chinese,
              companyType: response.type_of_business,
              natureofCompany: this.buisnessNature.find(
                (opt) => opt.code === response.natureOfBusiness_code
              ),
              Flat_Address: response.office_address,
              Building_Address: response.office_address1,
              District_Address: response.office_city,
              country_Address: response.office_country,
              company_Email: response.email_id,
              company_Telphone: response.mobile_number,
              company_Fax: response.fax,
              subscriptionDuration: response.subscriptionDuration,
              presentorName: response.presentorName,
              presentorChiName: response.presentorChiName,
              presentorAddress: response.presentorAddress,
              presentorBuilding: response.presentorBuilding,
              presentorStreet: response.presentorStreet,
              presentorDistrict: response.presentorDistrict,
              presentorTel: response.presentorTel,
              presentorFax: response.presentorFax,
              presentorEmail: response.presentorEmail,
              presentorReferance: response.reference_no,
              companyLogo: response.company_logo,
            });

            // Set image preview if logo exists
            if (response.company_logo) {
              this.imagePreview = response.company_logo;
            }

            console.log('Company data loaded and form populated');
          }
        },
        error: (error: any) => {
          console.error('Error loading company data:', error);
        },
      });
    }
  }

  toggleDropdown(field: string) {
    this.dropdowns[field].isOpen = !this.dropdowns[field].isOpen;

    Object.keys(this.dropdowns).forEach(key => {
      if (key !== field) this.dropdowns[key].isOpen = false;
    });
  }

  selectItem(field: string, item: string) {
    this.dropdowns[field].selected = item;
    this.dropdowns[field].isOpen = false;

    switch (field) {
      case 'telephone1':
        this.companyInfoForm.patchValue({ company_TelCountry: item });
        break;
      case 'fax1':
        this.companyInfoForm.patchValue({ company_FaxCountry: item });
        break;
      case 'telephone2':
        this.companyInfoForm.patchValue({ presentorTelCountry: item });
        break;
      case 'telephone3':
        this.shareHoldersForm.patchValue({ countryCode: item });
        break;
      case 'telephone4':
        this.directorInformationForm.patchValue({ countryCode: item });
        break;
      case 'telephone5':
        this.comapnySecretaryForm.patchValue({ countryCode: item });
        break;
      case 'fax2':
        this.companyInfoForm.patchValue({ presentorFaxCountry: item });
        break;
    }
  }

  onlyNumber(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }


  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event) {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.dropdown-container')) {
  //     this.isTelephoneOpen = false;
  //   }
  // }

  ngOnDestroy(): void {
    if (this.isNavigatingAway) {
      localStorage.removeItem('yourItemKey'); // Replace with actual key
      console.log('LocalStorage item removed on page exit.');
    }
  }
}
